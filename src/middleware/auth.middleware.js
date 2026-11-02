const jwt = require('jsonwebtoken');
const config = require('../config');
const sendError = require('../utils/error-response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(
      res, req, 401,
      'UNAUTHORIZED',
      'Brak tokenu'
    );
  }

  if (
    !authHeader.startsWith('Bearer ') ||
    !authHeader.slice(7).trim()
  ) {
    return sendError(
      res, req, 401,
      'UNAUTHORIZED',
      'Nieprawidłowy format nagłówka Authorization'
    );
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !['USER', 'ADMIN'].includes(payload.role)
    ) {
      return sendError(
        res, req, 401,
        'UNAUTHORIZED',
        'Nieprawidłowy token'
      );
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(
        res, req, 401,
        'TOKEN_EXPIRED',
        'Token wygasł'
      );
    }

    return sendError(
      res, req, 401,
      'UNAUTHORIZED',
      'Nieprawidłowy lub zmodyfikowany token'
    );
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res, req, 403,
        'FORBIDDEN',
        'Brak uprawnień do wykonania tej operacji'
      );
    }

    return next();
  };
}

module.exports = { authenticate, authorize };