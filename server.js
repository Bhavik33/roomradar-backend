const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Environment Validation
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
  console.error('❌ CRITICAL ERROR: Missing environment variables:', missingEnv.join(', '));
  console.error('Please set these variables in your deployment dashboard.');
}

const app = express();

// Middleware
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
const allowedOrigins = [clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

console.log('--- Environment Check ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Allowed Origins:', allowedOrigins);
console.log('-------------------------');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Normalize origins by removing trailing slashes
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(ao => ao === normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🔒 CORS blocked request from origin: ${origin}`);
      // Send a successful callback but CORS headers will be missing for this origin
      // This prevents some server-side proxy crashes compared to passing an Error()
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check & Basic Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.send('RoomRadar API is running...');
});


// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Root path for routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/roommates', require('./routes/roommateRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve frontend in production and handle client-side routing
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io Setup
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('addUser', (userId) => {
    if (!onlineUsers.find(user => user.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit('getUsers', onlineUsers);
  });

  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = onlineUsers.find(user => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit('getUsers', onlineUsers);
  });
});

// Global Error Handler (Last middleware)
app.use((err, req, res, next) => {
  console.error('🔥 UNHANDLED ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});
