const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const bodyDataRoutes = require('./routes/bodyData');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/feeding', feedingRoutes);
app.use('/api/diaper', diaperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bodyData', bodyDataRoutes);

// Serve admin login page
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve admin portal
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; 