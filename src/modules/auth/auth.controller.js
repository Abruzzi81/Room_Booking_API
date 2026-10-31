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
        code: 'VALIDATION_ERROR',
        message: error.message,
      });
    }

    next(error);
  }
}

module.exports = {
  register,
};