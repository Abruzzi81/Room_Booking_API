const AppError = require('../errors/app.error');
const { ZodError } = require('zod');

function errorMiddleware(err, req, res, next) {
  const requestId = req.requestId || 'unknown';

  // Nieprawidłowy JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON format in request body',
        details: null,
        requestId,
      },
    });
  }

  // Błędy walidacji Zod
  if (err instanceof ZodError || err.name === 'ZodError') {
    const issues = err.errors || err.issues || [];

    const details = issues.map((e) => ({
      location: e.path[0] || 'body',
      field: e.path.slice(1).join('.') || e.path[e.path.length - 1] || '',
      message: e.message,
    }));

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
        requestId,
      },
    });
  }

  // Błędy aplikacji
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
        requestId,
      },
    });
  }

  // Konflikty PostgreSQL
  if (err.code === '23505') {
    let message = 'Resource already exists';
    let code = 'CONFLICT';

    if (err.constraint && err.constraint.includes('rooms')) {
      message = 'A room with this name already exists in this building';
      code = 'ROOM_ALREADY_EXISTS';
    } else if (err.constraint && err.constraint.includes('buildings')) {
      message = 'A building with this name already exists';
      code = 'BUILDING_ALREADY_EXISTS';
    }

    return res.status(409).json({
      error: {
        code,
        message,
        details: null,
        requestId,
      },
    });
  }

  // Nieoczekiwane błędy serwera
  console.error(`[CRITICAL ERROR] ${requestId}:`, err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: null,
      requestId,
    },
  });
}

module.exports = errorMiddleware;