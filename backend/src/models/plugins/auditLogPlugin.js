const httpContext = require('express-http-context');
const mongoose = require('mongoose');

function auditLogPlugin(schema, options) {
  schema.pre('save', function (next) {
    if (this.isNew) {
      this._isNewRecord = true;
    } else {
      this._originalDoc = this.$locals.originalDoc || null; // Requires fetching original
      this._isNewRecord = false;
      this._modifiedPaths = this.modifiedPaths();
    }
    next();
  });

  schema.post('save', async function (doc) {
    if (['AuditLog', 'AdminPassword'].includes(doc.constructor.modelName)) return;
    try {
      const AuditLog = mongoose.model('AuditLog');
      const userId = httpContext.get('user');
      const ipAddress = httpContext.get('ipAddress');
      
      const action = this._isNewRecord ? 'CREATE' : 'UPDATE';
      const changes = {};

      if (action === 'UPDATE' && this._modifiedPaths) {
        this._modifiedPaths.forEach((path) => {
          if (path !== 'updated' && path !== 'created') {
             changes[path] = {
               new: doc[path],
             };
          }
        });
      }

      await new AuditLog({
        user: userId || null,
        action: action,
        entity: doc.constructor.modelName,
        documentId: doc._id,
        changes: action === 'UPDATE' ? changes : null,
        ipAddress: ipAddress || 'Unknown',
      }).save();
    } catch (err) {
      console.error('AuditLog Plugin Error on save:', err);
    }
  });

  // Handle findOneAndUpdate (Update)
  schema.post('findOneAndUpdate', async function (doc) {
    if (!doc || ['AuditLog', 'AdminPassword'].includes(doc.constructor.modelName)) return;
    try {
      const AuditLog = mongoose.model('AuditLog');
      const userId = httpContext.get('user');
      const ipAddress = httpContext.get('ipAddress');

      const updateInfo = this.getUpdate();

      await new AuditLog({
        user: userId || null,
        action: 'UPDATE',
        entity: doc.constructor.modelName,
        documentId: doc._id,
        changes: updateInfo,
        ipAddress: ipAddress || 'Unknown',
      }).save();
    } catch (err) {
      console.error('AuditLog Plugin Error on findOneAndUpdate:', err);
    }
  });

  // Handle findOneAndDelete (Delete)
  schema.post('findOneAndDelete', async function (doc) {
    if (!doc || ['AuditLog', 'AdminPassword'].includes(doc.constructor.modelName)) return;
    try {
      const AuditLog = mongoose.model('AuditLog');
      const userId = httpContext.get('user');
      const ipAddress = httpContext.get('ipAddress');

      await new AuditLog({
        user: userId || null,
        action: 'DELETE',
        entity: doc.constructor.modelName,
        documentId: doc._id,
        changes: null,
        ipAddress: ipAddress || 'Unknown',
      }).save();
    } catch (err) {
      console.error('AuditLog Plugin Error on findOneAndDelete:', err);
    }
  });
}

module.exports = auditLogPlugin;
