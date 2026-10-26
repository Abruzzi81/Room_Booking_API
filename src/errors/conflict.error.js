const AppError = require('./app.error');

class ConflictError extends AppError {
  constructor(message, code = "CONFLICT") {
    super(message, 409, code);
  }
}

module.exports = ConflictError;