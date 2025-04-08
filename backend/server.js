const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const moment = require('moment-timezone');
const { 
    startOfDay, 
    endOfDay, 
    getCurrentLocalTime,
    isValidTimestamp,
    isFutureTimestamp 
} = require('./utils/dateUtils');
const winston = require('winston');
const FeedingRecord = require('./models/feeding');
const adminRoutes = require('./routes/admin');
const Logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const SettingsService = require('./services/settingsService');
const statisticsRoutes = require('./routes/statistics');
const bodyDataRoutes = require('./routes/bodyData');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Add console logging if not in production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Serve static files from the public directory using absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files for main routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/statistics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'statistics.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Import routes
const feedingRoutes = require('./routes/feeding');
const diaperRoutes = require('./routes/diaper');
const tipsRoutes = require('./routes/tips');
const babyRoutes = require('./routes/baby');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/diaper', diaperRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/bodyData', bodyDataRoutes);

// Add health check endpoint before other routes
app.get('/health', (req, res) => {
    try {
        const healthcheck = {
            status: 'ok',
            timestamp: new Date(),
            uptime: process.uptime(),
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            env: process.env.NODE_ENV
        };
        
        // Log health check for debugging
        console.log('Health check requested:', healthcheck);
        
        res.status(200).json(healthcheck);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date()
        });
    }
});

// Add time check endpoint
app.get('/api/timecheck', (req, res) => {
    try {
        const now = getCurrentLocalTime();
        const timeCheck = {
            serverTime: {
                utc: now.utc().format(),
                local: now.format(),
                timestamp: now.valueOf()
            },
            timeZone: {
                name: process.env.TIMEZONE || 'America/Los_Angeles',
                offset: now.format('Z'),
                isDST: now.isDST()
            },
            format: {
                date: now.format('YYYY-MM-DD'),
                time: now.format('HH:mm:ss'),
                full: now.format('YYYY-MM-DD HH:mm:ss Z')
            }
        };
        
        logger.info('Time check performed', timeCheck);
        res.json(timeCheck);
    } catch (error) {
        logger.error('Time check failed', { error: error.message });
        res.status(500).json({ message: error.message });
    }
});

// MongoDB connection with proper error handling
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/baby_care';
    console.log('MongoDB URI:', mongoUri.replace(/mongodb:\/\/[^/]+/, 'mongodb://****'));
    console.log('Environment:', process.env.NODE_ENV);

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      family: 4,
      maxPoolSize: 10,
      directConnection: true,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 1000,
      minHeartbeatFrequencyMS: 100
    };

    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(mongoUri, options);

    console.log('Connected to MongoDB successfully');
    Logger.info('Database connected successfully');

    // Initialize settings
    await SettingsService.initialize();
    Logger.info('Settings initialized successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    Logger.error('Database connection failed', { error: err.message });
    
    // Wait for 5 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectDB(); // Retry connection
  }

  // Add connection error handlers
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    Logger.error('Database connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    Logger.warn('Database disconnected');
    // Attempt to reconnect
    setTimeout(() => {
      console.log('Attempting to reconnect to MongoDB...');
      connectDB();
    }, 5000);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    Logger.info('Database reconnected');
  });
}

// Initialize database connection
connectDB();

// Configure Mongoose
mongoose.set('strictQuery', false);

// Add timezone handling middleware for all models
const handleTimestamp = function(next) {
  if (this.isModified('timestamp')) {
    const date = new Date(this.timestamp);
    // Ensure the date is stored correctly
    this.timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    );
  }
  next();
};

// Apply timezone middleware to models
const Feeding = require('./models/feeding');
const Diaper = require('./models/diaper');

[FeedingRecord, Diaper].forEach(Model => {
  Model.schema.pre('save', handleTimestamp);
});

// Server setup with proper error handling
const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_RETRIES = 10;
const PORT_RANGE = 100;

async function findAvailablePort(startPort) {
    startPort = parseInt(startPort, 10);
    const net = require('net');
    
    async function isPortAvailable(port) {
        port = parseInt(port, 10);
        return new Promise((resolve) => {
            const server = net.createServer()
                .once('error', () => resolve(false))
                .once('listening', () => {
                    server.close();
                    resolve(true);
                })
                .listen(port, HOST);
        });
    }

    for (let i = 0; i < MAX_RETRIES; i++) {
        const port = parseInt(startPort + i, 10);
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available ports found in range ${startPort} to ${startPort + MAX_RETRIES - 1}`);
}

async function startServer(initialPort) {
    try {
        const port = parseInt(await findAvailablePort(initialPort), 10);
        
        return new Promise((resolve, reject) => {
            const server = app.listen(port, HOST)
                .once('listening', () => {
                    console.log(`Server is running on http://${HOST}:${port}`);
                    console.log('Environment:', process.env.NODE_ENV);
                    if (process.env.MONGODB_URI) {
                        console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/mongodb:\/\/[^/]+/, 'mongodb://****'));
                    }
                    resolve(server);
                })
                .once('error', (error) => {
                    console.error('Server startup error:', error);
                    reject(error);
                });

            // Add error handler for subsequent errors
            server.on('error', (error) => {
                console.error('Server runtime error:', error);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        throw error;
    }
}

let server;
async function initServer() {
    try {
        server = await startServer(PORT);
        
        // Graceful shutdown handling
        const shutdown = async (signal) => {
            console.log(`Received ${signal}. Shutting down server...`);
            try {
                if (server) {
                    await new Promise(resolve => server.close(resolve));
                    console.log('Server closed');
                }
                if (mongoose.connection.readyState === 1) {
                    await mongoose.connection.close();
                    console.log('Database connection closed');
                }
                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        };

        // Handle termination signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Unhandled rejection handling
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Uncaught exception handling
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });

        return server;
    } catch (error) {
        console.error('Server initialization failed:', error);
        process.exit(1);
    }
}

// Initialize server and export for testing
if (require.main === module) {
    initServer().catch(err => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });
} else {
    module.exports = { app, initServer };
}

// Get feeding records for a specific date
app.get('/api/feeding/baby/:babyId', async (req, res) => {
    try {
        const { babyId } = req.params;
        const { date } = req.query;

        if (!date) {
            throw new Error('Date parameter is required');
        }

        // Create date range for the query using utility functions
        const start = startOfDay(date);
        const end = endOfDay(date);

        const records = await FeedingRecord
            .find({
                babyId,
                timestamp: {
                    $gte: start,
                    $lt: end
                }
            })
            .sort({ timestamp: -1 })
            .limit(20);

        // Records are automatically converted to the correct timezone by the model's get transform

        logger.info('Feeding records retrieved successfully', {
            babyId,
            date,
            recordCount: records.length,
            timeRange: {
                start: moment(start).tz(process.env.TIMEZONE || 'America/Los_Angeles').format(),
                end: moment(end).tz(process.env.TIMEZONE || 'America/Los_Angeles').format()
            }
        });

        res.json(records);
    } catch (error) {
        logger.error('Failed to get feeding records', { error: error.message });
        res.status(500).json({ message: error.message });
    }
});

// Add feeding record endpoint
app.post('/api/feeding', async (req, res) => {
    try {
        const { timestamp, type, notes, babyId, ...details } = req.body;

        if (!isValidTimestamp(timestamp)) {
            throw new Error('Invalid timestamp');
        }

        if (isFutureTimestamp(timestamp)) {
            throw new Error('Cannot create records for future times');
        }

        const record = new FeedingRecord({
            timestamp,
            type,
            notes,
            babyId,
            ...details
        });

        await record.save();
        
        logger.info('Feeding record created successfully', {
            recordId: record._id,
            timestamp: moment(record.timestamp).tz(process.env.TIMEZONE || 'America/Los_Angeles').format(),
            type
        });

        res.status(201).json(record);
    } catch (error) {
        logger.error('Failed to create feeding record', { error: error.message });
        res.status(400).json({ message: error.message });
    }
}); 