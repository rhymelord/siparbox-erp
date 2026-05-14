/**
 * Role-based access control middleware.
 * Usage: requireRole('admin', 'pazarlamaci_mudur')
 * Checks if the authenticated user has one of the allowed roles.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.admin?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Bu sayfaya erişim yetkiniz yok.',
      });
    }
    next();
  };
};

module.exports = { requireRole };
