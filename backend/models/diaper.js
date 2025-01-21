const mongoose = require('mongoose');

const diaperSchema = new mongoose.Schema({
  babyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: () => new Date(),
    get: (date) => date ? new Date(date) : date
  },
  type: {
    type: String,
    enum: ['pee', 'poo', 'both'],
    required: true
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

diaperSchema.index({ timestamp: 1, babyId: 1 });
diaperSchema.index({ isDeleted: 1 });

diaperSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add static methods for bulk operations
diaperSchema.statics.bulkDeleteByIds = async function(ids) {
  return this.updateMany(
    { _id: { $in: ids } },
    { $set: { isDeleted: true, updatedAt: new Date() } }
  );
};

// Add this to handle timezone conversion when querying
diaperSchema.set('toJSON', {
  getters: true,
  transform: (doc, ret) => {
    if (ret.timestamp) {
      ret.timestamp = new Date(ret.timestamp);
    }
    return ret;
  }
});

module.exports = mongoose.model('Diaper', diaperSchema); 