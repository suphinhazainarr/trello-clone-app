require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const boardRoutes = require('./routes/board.routes');
const listRoutes = require('./routes/list.routes');
const cardRoutes = require('./routes/card.routes');
const socketService = require('./services/socket.service');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO
socketService.initialize(server, {
  cors: corsOptions,
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', listRoutes);
app.use('/api', cardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 