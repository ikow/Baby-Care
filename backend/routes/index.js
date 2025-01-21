const express = require('express');
const router = express.Router();

// Add health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = router; 