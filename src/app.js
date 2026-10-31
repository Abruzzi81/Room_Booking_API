const express = require('express');
const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const NotFoundError = require('./errors/not-found.error');

const roomsRoutes = require('./modules/rooms/rooms.routes');
const reservationsRoutes = require('./modules/reservations/reservations.routes');
const buildingsRoutes = require('./modules/buildings/buildings.routes');

const authRoutes = require('./modules/auth/auth.routes');
const { authenticate } = require('./middleware/auth.middleware');


function createApp() {
  const app = express();

  app.use(express.json());
  app.use(loggerMiddleware); // Logowanie i X-Request-Id

  app.use((req, res, next) => {
    const publicRoutes = [
      req.method === 'POST' && req.path === '/api/auth/register',
      req.method === 'POST' && req.path === '/api/auth/login',
      req.path === '/api/docs' || req.path.startsWith('/api/docs/'),
    ];

    if (publicRoutes.some(Boolean)) {
      return next();
    }

    return authenticate(req, res, next);
  });

  // Trasy API
  app.use('/api/rooms', roomsRoutes);
  app.use('/api/reservations', reservationsRoutes);
  app.use('/api/buildings', buildingsRoutes);

  app.use('/api/auth', authRoutes);

  // Obsługa nieistniejących ścieżek (404 w formacie JSON)
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  // Centralny error handler (musi być na samym końcu)
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };