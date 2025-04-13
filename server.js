const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Route middlewares
app.use('/api/services', serviceRoutes); // Handles service-related routes
app.use('/api/admin', adminRoutes);      // Handles admin auth routes

// Connect to MongoDB database
connectDB();

// Root route for basic health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;

// Optional: Setup for sending test emails using nodemailer
const nodemailer = require('nodemailer');

// Temporary GET route to test email sending from server
app.get('/test-email', async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Status Page" <${process.env.EMAIL_USER}>`,
    to: 'yourotheremail@gmail.com',  // Replace with your actual test email
    subject: 'Test Email from Status Page App',
    text: 'If you received this email, your nodemailer setup is working perfectly.'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully');
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('Email send failed:', err);
    res.status(500).send('❌ Failed to send email');
  }
});

// Test endpoint to check if server is up
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', time: new Date().toISOString() });
});

// Dummy GET to simulate service fetch
app.get('/api/test/services', (req, res) => {
  res.status(200).json([
    { name: 'Payments', status: 'operational' },
    { name: 'Login API', status: 'degraded-performance' },
    { name: 'Dashboard UI', status: 'major-outage' }
  ]);
});

// Dummy POST to simulate a new service creation
app.post('/api/test/create', (req, res) => {
  const { name, status } = req.body;
  if (!name || !status) {
    return res.status(400).json({ message: 'Missing name or status' });
  }
  res.status(201).json({ message: 'Dummy service created', data: { name, status } });
});

// Start listening for requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
