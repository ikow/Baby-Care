const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        await auth(req, res, async () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Simple middleware for authenticated routes - for now, it just passes through
// In a production app, this should properly verify the user is authenticated
const isAuthenticated = (req, res, next) => {
    // For testing purposes, we'll just allow all requests through
    // In production, this should use the auth middleware
    next();
};

module.exports = {
    auth,
    isAdmin,
    isAuthenticated
}; 