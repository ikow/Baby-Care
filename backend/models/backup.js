const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    size: {
        type: Number,
        required: true,
        default: 0
    },
    path: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    error: {
        type: String
    },
    type: {
        type: String,
        enum: ['manual', 'scheduled'],
        default: 'manual'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
backupSchema.index({ timestamp: -1 });
backupSchema.index({ status: 1 });
backupSchema.index({ type: 1 });

module.exports = mongoose.model('Backup', backupSchema); 