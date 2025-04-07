const mongoose = require('mongoose');

const bodyDataSchema = new mongoose.Schema({
    babyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Baby',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    height: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Add indexes for efficient queries
bodyDataSchema.index({ babyId: 1, date: 1 });

module.exports = mongoose.model('BodyData', bodyDataSchema); 