const { Router } = require('express');
const ReservationsRepositoryMemory = require('./reservations.repository.memory');
const RoomsRepositoryMemory = require('../rooms/rooms.repository.memory');
const ReservationsService = require('./reservations.service');
const ReservationsController = require('./reservations.controller');
const validate = require('../../middleware/validate'); // Uniwersalny middleware z Zadania 2
const { 
  createReservationSchema, 
  getReservationsSchema, 
  reservationIdParamSchema 
} = require('./reservations.schemas');

const router = Router();

// Inicjalizacja zależności (Dependency Injection)
const reservationsRepository = new ReservationsRepositoryMemory();
const roomsRepository = new RoomsRepositoryMemory(); // Potrzebne do weryfikacji sal i pojemności
const reservationsService = new ReservationsService(reservationsRepository, roomsRepository);
const reservationsController = new ReservationsController(reservationsService);

// Trasy z wpiętą walidacją
router.get('/', validate(getReservationsSchema), reservationsController.getReservations);
router.post('/', validate(createReservationSchema), reservationsController.createReservation);
router.patch('/:id/cancel', validate(reservationIdParamSchema), reservationsController.cancelReservation);

module.exports = router;