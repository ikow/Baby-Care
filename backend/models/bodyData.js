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
        required: false,
        min: 0
    },
    height: {
        type: Number,
        required: false,
        min: 0
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// 验证：确保至少提供体重或身高中的一项
bodyDataSchema.pre('validate', function(next) {
    if ((this.weight === undefined || this.weight === null) && 
        (this.height === undefined || this.height === null)) {
        next(new Error('体重和身高至少需要提供一项'));
    } else {
        next();
    }
});

// Add indexes for efficient queries
bodyDataSchema.index({ babyId: 1, date: 1 });

module.exports = mongoose.model('BodyData', bodyDataSchema); 