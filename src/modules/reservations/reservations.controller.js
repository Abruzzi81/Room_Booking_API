const { toReservationResponse } = require('./reservations.mapper');

class ReservationsController {
  constructor(reservationsService) {
    this.reservationsService = reservationsService;
  }

  getReservations = async (req, res, next) => {
    try {
      const result = await this.reservationsService.getAllReservations(
        req.validated.query
      );

      res.status(200).json({
        data: result.data.map(toReservationResponse),
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  };


  getReservationById = async (req, res, next) => {
    try {
      const id = req.validated.params.id;
      const reservation =
        await this.reservationsService.getReservationById(id);

      res.status(200).json({
        ...toReservationResponse(reservation),
        room: reservation.room
      });
    } catch (error) {
      next(error);
    }
  };


  createReservation = async (req, res, next) => {
    try {
      const newReservation = await this.reservationsService.createReservation(
        req.validated.body,
        req.user.id
      );

      res.setHeader('Location', `/api/reservations/${newReservation.id}`);
      res.status(201).json(toReservationResponse(newReservation));
    } catch (error) {
      next(error);
    }
  };

  cancelReservation = async (req, res) => {
    const reservationId = req.validated.params.id;
    const updatedReservation = await this.reservationsService.cancelReservation(reservationId);

    res.status(200).json(toReservationResponse(updatedReservation));
  };
}

module.exports = ReservationsController;