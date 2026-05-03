const mongoose = require('mongoose');

const taxesSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  taxName: {
    type: String,
    required: true,
    trim: true,
  },
  taxValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Taxes', taxesSchema);
