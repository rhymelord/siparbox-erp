const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: false, // bazen login olmadan (örneğin auth sırasında) olabilir
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE'],
  },
  entity: {
    type: String, // e.g., "Invoice", "Client"
    required: false,
  },
  documentId: {
    type: mongoose.Schema.ObjectId,
    required: false,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // diffs (eski değer, yeni değer)
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL Index: Logs will be automatically deleted after 1 year (365 days)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
