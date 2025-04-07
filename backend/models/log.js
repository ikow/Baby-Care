const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    level: {
        type: String,
        enum: ['error', 'warn', 'info', 'debug'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for efficient querying
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema); 