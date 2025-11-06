const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
    if (!token) {
      if (required) return res.status(401).json({ error: 'Unauthorized' });
      return next();
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = { id: payload.sub, role: payload.role, email: payload.email, name: payload.name };
      return next();
    } catch (e) {
      if (required) return res.status(401).json({ error: 'Invalid token' });
      return next();
    }
  };
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { auth, requireRole };


