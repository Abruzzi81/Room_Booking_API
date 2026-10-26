const AppError = require('../errors/app.error');
const { ZodError } = require('zod');

function errorMiddleware(err, req, res, next) {
  const requestId = req.requestId || 'unknown';

  // Obsługa błędów parsowania JSON-a przez Express (body-parser)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Invalid JSON format in request body",
        requestId
      }
    });
  }

  // Obsługa błędów walidacji Zod (Zapewnia status 400 zamiast 500)
  if (err instanceof ZodError || err.name === 'ZodError') {
    const details = (err.errors || err.issues || []).map((e) => ({
      location: e.path[0] || 'body',
      field: e.path.slice(1).join('.') || e.path[e.path.length - 1] || '',
      message: e.message,
    }));

    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
        requestId
      }
    });
  }

  // Obsługa zdefiniowanych błędów aplikacji (AppError i dziedziczące)
  if (err instanceof AppError) {
    const responsePayload = {
      error: {
        code: err.code,
        message: err.message,
        requestId
      }
    };
    if (err.details) {
      responsePayload.error.details = err.details;
    }
    return res.status(err.statusCode).json(responsePayload);
  }

  // Nieoczekiwany błąd serwera (500) - stack trace trafia tylko do logów serwera
  console.error(`[CRITICAL ERROR] ${requestId}:`, err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      requestId
    }
  });
}

module.exports = errorMiddleware;