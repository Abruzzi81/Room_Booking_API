const crypto = require('crypto');

function loggerMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    
    console.log(`[${new Date().toISOString()}] ${requestId} - ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${durationMs}ms`);
  });

  next();
}

module.exports = loggerMiddleware;