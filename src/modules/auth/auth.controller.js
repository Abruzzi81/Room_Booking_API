const authService = require('./auth.service');
const sendError = require('../../utils/error-response');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'EMAIL_TAKEN') {
      return sendError(
        res, req, 409,
        'EMAIL_TAKEN',
        'Konto z tym adresem email już istnieje'
      );
    }

    if (error.code === 'VALIDATION_ERROR') {
      return sendError(
        res, req, 400,
        'VALIDATION_ERROR',
        error.message,
        error.details || null
      );
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return sendError(
        res, req, 401,
        'INVALID_CREDENTIALS',
        'Nieprawidłowy email lub hasło'
      );
    }

    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return sendError(
        res, req, 401,
        'UNAUTHORIZED',
        'Użytkownik nie istnieje'
      );
    }

    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};