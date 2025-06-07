const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketService = require('./services/socket.service');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS to Express
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO with CORS
socketService.initialize(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/boards', require('./routes/board.routes'));
app.use('/api', require('./routes/list.routes'));
app.use('/api', require('./routes/card.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 