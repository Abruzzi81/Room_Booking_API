const { Router } = require('express');
const reservationsRepository = require('./reservations.repository.knex');
const roomsRepository = require('../rooms/rooms.repository.knex');
const ReservationsService = require('./reservations.service');
const ReservationsController = require('./reservations.controller');
const validate = require('../../middleware/validate');
const { 
  createReservationSchema, 
  getReservationsSchema, 
  reservationIdParamSchema 
} = require('./reservations.schemas');

const router = Router();

// Inicjalizacja zależności z repozytoriami Knex
const reservationsService = new ReservationsService(reservationsRepository, roomsRepository);
const reservationsController = new ReservationsController(reservationsService);

// Trasy z wpiętą walidacją
router.get('/', validate(getReservationsSchema), reservationsController.getReservations);
router.post('/', validate(createReservationSchema), reservationsController.createReservation);
router.patch('/:id/cancel', validate(reservationIdParamSchema), reservationsController.cancelReservation);

module.exports = router;