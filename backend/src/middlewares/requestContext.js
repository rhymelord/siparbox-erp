const httpContext = require('express-http-context');

const requestContextMiddleware = (req, res, next) => {
  if (req.admin) {
    httpContext.set('user', req.admin._id);
  }
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  httpContext.set('ipAddress', ipAddress);
  next();
};

module.exports = requestContextMiddleware;
