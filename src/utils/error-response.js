function sendError(res, req, status, code, message, details = null) {
  return res.status(status).json({
    error: {
      code,
      message,
      details,
      requestId: req.requestId || 'unknown',
    },
  });
}

module.exports = sendError;