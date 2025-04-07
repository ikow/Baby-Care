const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Logger = require('../utils/logger');
const { auth } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByCredentials(username, password);
        const token = await user.generateAuthToken();
        
        Logger.info('User logged in', { username, role: user.role });
        
        res.json({ user, token });
    } catch (error) {
        Logger.warn('Login failed', { username: req.body.username, error: error.message });
        res.status(401).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        
        Logger.info('User logged out', { username: req.user.username });
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        Logger.error('Logout failed', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        Logger.error('Error fetching user profile', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const user = await User.findByCredentials(req.user.username, currentPassword);
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        Logger.info('Password changed', { username: user.username });
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        Logger.error('Password change failed', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 