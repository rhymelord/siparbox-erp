const mongoose = require('mongoose');

/**
 * Returns a MongoDB filter object based on the user's role.
 * - admin: no filter (sees everything)
 * - pazarlamaci_mudur: sees own data + subordinates' data
 * - pazarlamaci: sees only own data
 *
 * @param {Object} admin - The authenticated user (req.admin)
 * @param {String} fieldName - The field to filter on (default: 'createdBy')
 * @returns {Object} MongoDB filter object
 */
const getRoleFilter = async (admin, fieldName = 'createdBy') => {
  if (!admin || !admin.role) return {};

  // Admin sees everything
  if (admin.role === 'admin') {
    return {};
  }

  // Pazarlamacı Müdür sees own + subordinates' data
  if (admin.role === 'pazarlamaci_mudur') {
    const Admin = mongoose.model('Admin');
    const subordinates = await Admin.find({
      manager: admin._id,
      removed: false,
    }).select('_id');

    const subordinateIds = subordinates.map((s) => s._id);
    return {
      [fieldName]: { $in: [admin._id, ...subordinateIds] },
    };
  }

  // Pazarlamacı sees only own data
  if (admin.role === 'pazarlamaci') {
    return {
      [fieldName]: admin._id,
    };
  }

  // Fallback: no data
  return { [fieldName]: null };
};

module.exports = { getRoleFilter };
