# Firebase Socket.IO Chatroom: Setup & Deployment Guide

_Adapted from G’s deployment instructions (2025-05-28)_

## 1. Initialize Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions hosting
# Choose Node 18 for Cloud Functions
```

## 2. Directory Structure

```
functions/
  index.js          # Cloud Function entrypoint
  package.json      # deps: express, socket.io, cors
  .env              # AUTH_TOKEN=your_secret
public/
  index.html        # Chatroom UI
```

## 3. `functions/index.js`

```js
const functions = require('firebase-functions');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 5000,
  pingTimeout: 20000,
});

const AUTH_TOKEN = process.env.AUTH_TOKEN;

io.use((socket, next) => {
  if (socket.handshake.auth?.token === AUTH_TOKEN) return next();
  next(new Error('Auth error'));
});

io.on('connection', (socket) => {
  socket.on('message', (data) => io.emit('message', data));
});

exports.echoChat = functions
  .region('us-central1')
  .https.onRequest(server);
```

## 4. `functions/package.json`

```json
{
  "main": "index.js",
  "engines": { "node": "18" },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

## 5. `firebase.json`

```json
{
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "public": "public",
    "rewrites": [
      { "source": "**", "function": "echoChat" }
    ]
  }
}
```

## 6. Deploy

```bash
firebase deploy --only functions,hosting
```

## 7. Testing

1. Connect with `io('https://<project>.web.app', { auth: { token: AUTH_TOKEN } })`
2. Send: `{ from_agent: 'O', to_agent: 'G3', payload: { task: 'ping', content: 'Hello Council' } }`
3. Verify broadcast and latency logs.

---

_This guide will evolve as we refine relay optimizations and UI._
