const { toReservationResponse } = require('./reservations.mapper');

class ReservationsController {
  constructor(reservationsService) {
    this.reservationsService = reservationsService;
  }

  getReservations = async (req, res) => {
    // Odczytujemy zweryfikowany query parametr z req.validated
    const roomId = req.validated?.query?.roomId;
    const reservations = await this.reservationsService.getAllReservations(roomId);
    
    // Każdy element przekształcamy przez mapper (DTO)
    res.status(200).json(reservations.map(toReservationResponse));
  };

  createReservation = async (req, res) => {
    // Korzystamy z req.validated.body (zgodnie z Zadaniem 2)
    const newReservation = await this.reservationsService.createReservation(req.validated.body);
    
    // Wymóg z Zadania 5B: status 201 oraz nagłówek Location: /api/reservations/{id}
    res.setHeader('Location', `/api/reservations/${newReservation.id}`);
    res.status(201).json(toReservationResponse(newReservation));
  };

  cancelReservation = async (req, res) => {
    const reservationId = req.validated.params.id;
    const updatedReservation = await this.reservationsService.cancelReservation(reservationId);
    
    res.status(200).json(toReservationResponse(updatedReservation));
  };
}

module.exports = ReservationsController;