const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/user');
const Log = require('../models/log');
const BackupService = require('../services/backupService');
const Logger = require('../utils/logger');
const SettingsService = require('../services/settingsService');

// Unprotected routes
// Admin setup route (one-time use)
router.post('/setup', async (req, res) => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            throw new Error('Admin user already exists');
        }

        // Create admin user
        const user = new User({
            username: 'admin',
            password: 'admin123456',
            role: 'admin',
            status: 'active'
        });
        await user.save();
        
        Logger.info('Admin user created');
        res.json({ message: 'Admin user created successfully' });
    } catch (error) {
        Logger.error('Admin setup failed', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

// Admin login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByCredentials(username, password);
        
        if (user.role !== 'admin') {
            throw new Error('Not authorized as admin');
        }
        
        const token = await user.generateAuthToken();
        user.lastLogin = new Date();
        await user.save();
        
        Logger.info('Admin logged in', { username });
        res.json({ token });
    } catch (error) {
        Logger.warn('Admin login failed', { username: req.body.username, error: error.message });
        res.status(401).json({ error: 'Please authenticate' });
    }
});

// Protected routes
router.use(isAdmin);

// System Stats
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, dbStats, memUsage] = await Promise.all([
            User.countDocuments(),
            getDBStats(),
            getMemoryUsage()
        ]);

        res.json({
            totalUsers,
            dbSize: dbStats.dataSize,
            uptime: Math.floor(process.uptime()),
            memoryUsage: memUsage
        });
    } catch (error) {
        Logger.error('Failed to get system stats', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Logs Management
router.get('/logs', async (req, res) => {
    try {
        const { level, date } = req.query;
        const query = {};
        
        if (level && level !== 'all') {
            query.level = level;
        }
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.timestamp = { $gte: startDate, $lt: endDate };
        }
        
        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .limit(1000);
            
        res.json(logs);
    } catch (error) {
        Logger.error('Failed to get logs', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Database Backup
router.post('/backup', async (req, res) => {
    try {
        const backup = await BackupService.createBackup(req.user._id);
        res.json({ success: true, backup });
    } catch (error) {
        Logger.error('Failed to create backup', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.get('/backup/history', async (req, res) => {
    try {
        const backups = await BackupService.getBackups();
        res.json(backups);
    } catch (error) {
        Logger.error('Failed to get backup history', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.post('/backup/:id/restore', async (req, res) => {
    try {
        const result = await BackupService.restoreBackup(req.params.id);
        res.json(result);
    } catch (error) {
        Logger.error('Failed to restore backup', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.delete('/backup/:id', async (req, res) => {
    try {
        await BackupService.deleteBackup(req.params.id);
        res.json({ success: true });
    } catch (error) {
        Logger.error('Failed to delete backup', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// User Management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -tokens')
            .sort({ username: 1 });
        res.json(users);
    } catch (error) {
        Logger.error('Failed to get users', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/:id/toggle-status', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();

        Logger.info('User status updated', { userId: user._id, status: user.status });
        res.json({ success: true, user });
    } catch (error) {
        Logger.error('Failed to toggle user status', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Analytics
router.get('/analytics/user-activity', async (req, res) => {
    try {
        const activity = await Log.aggregate([
            { $match: { level: 'info', 'details.action': { $exists: true } } },
            { $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    action: '$details.action'
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.date': 1 } }
        ]);
        res.json(activity);
    } catch (error) {
        Logger.error('Failed to get user activity', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics/resource-usage', async (req, res) => {
    try {
        const usage = {
            cpu: os.loadavg()[0],
            memory: process.memoryUsage(),
            uptime: os.uptime()
        };
        res.json(usage);
    } catch (error) {
        Logger.error('Failed to get resource usage', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics/error-rate', async (req, res) => {
    try {
        const errors = await Log.aggregate([
            { $match: { level: 'error' } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        res.json(errors);
    } catch (error) {
        Logger.error('Failed to get error rate', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Settings Management
router.get('/settings', async (req, res) => {
    try {
        const settings = await SettingsService.getAll();
        res.json(settings);
    } catch (error) {
        Logger.error('Failed to get settings', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

router.get('/settings/:category', async (req, res) => {
    try {
        const settings = await SettingsService.getAll(req.params.category);
        res.json(settings);
    } catch (error) {
        Logger.error('Failed to get category settings', { 
            category: req.params.category,
            error: error.message 
        });
        res.status(500).json({ error: error.message });
    }
});

router.post('/settings', async (req, res) => {
    try {
        const updates = await SettingsService.updateBatch(req.body.settings, req.user._id);
        res.json(updates);
    } catch (error) {
        Logger.error('Failed to update settings', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Utility functions
async function getDBStats() {
    const db = mongoose.connection.db;
    return await db.stats();
}

async function getMemoryUsage() {
    const used = process.memoryUsage();
    return {
        heapTotal: used.heapTotal,
        heapUsed: used.heapUsed,
        rss: used.rss
    };
}

async function saveSettings(settings) {
    // Implement settings storage logic
    // This could be in a database or config file
}

module.exports = router; 