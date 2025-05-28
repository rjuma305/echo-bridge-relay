// chatroom_server/server.js
// EchoBridge Chatroom Backend (Socket.IO + Express)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'REPLACE_ME';

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token === AUTH_TOKEN) {
    return next();
  }
  return next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
  console.log('Agent connected:', socket.id);

  socket.on('message', (data) => {
    // Basic validation could be added here
    console.log('Incoming message:', data);
    io.emit('message', data); // Broadcast to all agents
  });

  socket.on('disconnect', () => {
    console.log('Agent disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`EchoBridge Chatroom running on port ${PORT}`);
});
