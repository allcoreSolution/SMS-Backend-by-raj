// server.js - Auth & Password Reset Active
require('dotenv').config();

const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5050;
const server = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length === 0 || allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token || !process.env.JWT_SECRET) {
      socket.data.isGuest = true;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id ||
        decoded.userId || decoded.sub;

      if (userId) {
        socket.data.userId = String(userId);
        socket.data.userRole = decoded.role || 'User';
      }
    } catch {
      socket.data.isGuest = true;
    }

    next();
  } catch {
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.data.userId) {
    socket.join(`user:${socket.data.userId}`);
  }
  socket.join('transport:fleet');

  console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId || 'Guest/Transport'})`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`School ERP API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
