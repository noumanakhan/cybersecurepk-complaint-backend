const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

// Initialize DB connections
require('./config/db');

const corsOptions = {
  origin: [
    'https://complaint.cybersecurepakistan.pk',
    'http://localhost:3000', // For local development
    'http://localhost:5173'  // For local development (Vite default)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const app = express();

// Trust the NGINX reverse proxy to accurately provide the client's IP address
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Escalation Monitor (Runs every hour)
const Complaint = require('./models/Complaint');
const Activity = require('./models/Activity');

setInterval(async () => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const overdueTickets = await Complaint.find({
      status: { $in: ['OPEN', 'IN_PROGRESS', 'PENDING'] },
      createdAt: { $lt: fortyEightHoursAgo }
    });

    for (const ticket of overdueTickets) {
      ticket.status = 'ESCALATED';
      ticket.escalatedAt = new Date();
      await ticket.save();
      
      await Activity.create({
        complaintId: ticket._id,
        userId: '000000000000000000000000', // System User ID
        action: 'AUTO_ESCALATED',
        details: 'Ticket automatically escalated due to 48h resolution delay.'
      });
      console.log(`[ESCALATION] Ticket ${ticket.ticketId} escalated automatically.`);
    }
  } catch (err) {
    console.error('Escalation Job Error:', err);
  }
}, 3600000); // 1 hour

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinTicket', (ticketId) => {
    socket.join(ticketId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.ticketId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// DB connections are now handled in config/db.js

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});