const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { isValidTimestamp, isFutureTimestamp } = require('../utils/dateUtils');

const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

const feedingSchema = new mongoose.Schema({
  babyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Validate timestamp is not in the future
        return isValidTimestamp(value) && !isFutureTimestamp(value, DEFAULT_TIMEZONE);
      },
      message: props => 'Invalid timestamp or future date not allowed'
    },
    get: function(date) {
      if (!date) return date;
      // Return date in the configured timezone
      return moment(date).tz(DEFAULT_TIMEZONE).toDate();
    },
    set: function(date) {
      if (!date) return date;
      // Store date in UTC while preserving the timezone-specific time
      return moment.tz(date, DEFAULT_TIMEZONE).utc().toDate();
    },
    index: true
  },
  type: {
    type: String,
    enum: ['formula', 'breastfeeding', 'diaper'],
    required: true,
    validate: {
      validator: function(v) {
        return ['formula', 'breastfeeding', 'diaper'].includes(v);
      },
      message: props => `${props.value} is not a valid feeding type`
    }
  },
  volume: {
    type: Number,
    required: function() {
      return this.type === 'formula';
    },
    min: 0,
    validate: {
      validator: function(v) {
        return this.type !== 'formula' || v > 0;
      },
      message: 'Volume must be greater than 0 for formula feeding'
    }
  },
  duration: {
    type: Number,
    required: function() {
      return this.type === 'breastfeeding';
    },
    min: 0,
    validate: {
      validator: function(v) {
        return this.type !== 'breastfeeding' || v > 0;
      },
      message: 'Duration must be greater than 0 for breastfeeding'
    }
  },
  diaperType: {
    type: String,
    enum: ['pee', 'poo', 'both'],
    required: function() {
      return this.type === 'diaper' && !this.isDeleted;
    },
    validate: {
      validator: function(v) {
        if (this.type !== 'diaper') return true;
        return ['pee', 'poo', 'both'].includes(v);
      },
      message: props => `${props.value} is not a valid diaper type`
    }
  },
  notes: {
    type: String,
    trim: true
  },
  // Add these fields for better record keeping
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  } // Soft delete flag
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: (doc, ret) => {
      if (ret.timestamp) {
        ret.timestamp = new Date(ret.timestamp);
      }
      return ret;
    }
  }
});

// Compound index for efficient querying
feedingSchema.index({ babyId: 1, timestamp: 1, isDeleted: 1 });

// Update timestamps on save
feedingSchema.pre('save', function(next) {
  if (this.isModified('type')) {
    // Ensure type is one of the allowed values
    if (!['formula', 'breastfeeding', 'diaper'].includes(this.type)) {
      next(new Error('Invalid feeding type'));
      return;
    }
  }
  this.updatedAt = new Date();
  next();
});

// Static methods
feedingSchema.statics.bulkDeleteByIds = async function(ids) {
  const result = await this.updateMany(
    { _id: { $in: ids } },
    { 
      $set: { 
        isDeleted: true,
        updatedAt: new Date()
      } 
    }
  );
  return result;
};

module.exports = mongoose.model('Feeding', feedingSchema); 