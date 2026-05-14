const mongoose = require('mongoose');

const logout = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');

  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (token)
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  else
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();

  const AuditLog = mongoose.model('AuditLog');
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  await new AuditLog({
    user: req.admin._id,
    action: 'LOGOUT',
    entity: 'Admin',
    ipAddress: ipAddress || 'Unknown',
  }).save();

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
