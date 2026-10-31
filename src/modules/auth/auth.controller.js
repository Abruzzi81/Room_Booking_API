const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'EMAIL_TAKEN') {
      return res.status(409).json({
        code: 'EMAIL_TAKEN',
        message: 'Konto z tym adresem email już istnieje',
      });
    }

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        code: error.code,
        message: error.message,
      });
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
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Nieprawidłowy email lub hasło',
      });
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
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Użytkownik nie istnieje',
      });
    }

    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};