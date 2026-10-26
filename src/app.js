const express = require('express');
const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const NotFoundError = require('./errors/not-found.error');

const roomsRoutes = require('./modules/rooms/rooms.routes');
const reservationsRoutes = require('./modules/reservations/reservations.routes');
const buildingsRoutes = require('./modules/buildings/buildings.routes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(loggerMiddleware); // Logowanie i X-Request-Id

  // Trasy API
  app.use('/api/rooms', roomsRoutes);
  app.use('/api/reservations', reservationsRoutes);
  app.use('/api/buildings', buildingsRoutes);

  // Tymczasowy endpoint do testowania błędu 500 (Zadanie 3)
  app.get('/api/debug/crash', (req, res, next) => {
    throw new Error("boom");
  });

  // Obsługa nieistniejących ścieżek (404 w formacie JSON)
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  // Centralny error handler (musi być na samym końcu)
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };