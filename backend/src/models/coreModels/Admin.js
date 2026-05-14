const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: false,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  name: { type: String, required: true },
  surname: { type: String },
  photo: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'pazarlamaci_mudur', 'pazarlamaci'],
  },
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    default: null,
  },
});

module.exports = mongoose.model('Admin', adminSchema);
