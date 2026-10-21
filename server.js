// server.js
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
    const token = socket.handshake.auth?.token;

    if (!token || !process.env.JWT_SECRET) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id ||
      decoded.userId || decoded.sub;

    if (!userId) {
      return next(new Error('Invalid token payload'));
    }

    socket.data.userId = String(userId);
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.data.userId}`);

  console.log('Authenticated chat socket connected');

  socket.on('disconnect', () => {
    console.log('Chat socket disconnected');
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
