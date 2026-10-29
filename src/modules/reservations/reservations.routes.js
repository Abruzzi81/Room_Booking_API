
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

const reservationsService = new ReservationsService(
  reservationsRepository,
  roomsRepository
);

const reservationsController = new ReservationsController(
  reservationsService
);

router.get(
  '/',
  validate(getReservationsSchema),
  reservationsController.getReservations
);

router.post(
  '/',
  validate(createReservationSchema),
  reservationsController.createReservation
);

router.delete(
  '/:id',
  validate(reservationIdParamSchema),
  reservationsController.cancelReservation
);


router.get(
  '/:id',
  validate(reservationIdParamSchema),
  reservationsController.getReservationById
);


module.exports = router;
