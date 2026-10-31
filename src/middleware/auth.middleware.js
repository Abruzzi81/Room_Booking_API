const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Brak lub nieprawidłowy token',
    });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error('Brak konfiguracji JWT_SECRET'));
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !['USER', 'ADMIN'].includes(payload.role)
    ) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Nieprawidłowy token',
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token jest nieprawidłowy lub wygasł',
    });
  }
}

module.exports = {
  authenticate,
};