const { ZodError } = require('zod');
const ValidationError = require('../errors/validation.error');

const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Przypisanie zweryfikowanych danych do req.validated
    req.validated = parsed;
    return next();
  } catch (error) {
    // Sprawdzamy, czy to błąd Zoda i czy zawiera tablicę błędów/issues
    if (error instanceof ZodError || error.name === 'ZodError') {
      const issues = error.errors || error.issues || [];
      
      const details = issues.map((err) => ({
        location: err.path[0] || 'body',
        field: err.path.slice(1).join('.') || err.path[err.path.length - 1] || '',
        message: err.message,
      }));

      return next(new ValidationError("Validation failed", details));
    }

    // Jeśli to inny błąd, przekazujemy go dalej
    return next(error);
  }
};

module.exports = validate;