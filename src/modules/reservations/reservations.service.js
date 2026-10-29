const ConflictError = require('../../errors/conflict.error');
const AppError = require('../../errors/app.error');
const NotFoundError = require('../../errors/not-found.error');

class ReservationsService {
  constructor(reservationsRepository, roomsRepository, now = () => new Date()) {
    this.reservationsRepository = reservationsRepository;
    this.roomsRepository = roomsRepository;
    this.now = now;
  }

  async getAllReservations(query = {}) {
    return this.reservationsRepository.findPage(query);
  }

  async getReservationById(id) {
    const reservation =
      await this.reservationsRepository.findByIdWithRoomAndBuilding(id);

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    return reservation;
  }



  async createReservation(data) {
    const { roomId, title, startTime, endTime } = data;

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const currentTime = this.now().getTime();

    if (startMs < currentTime) {
      throw new AppError(
        'Start time cannot be in the past',
        400,
        'INVALID_START_TIME'
      );
    }

    if (endMs <= startMs) {
      throw new AppError(
        'End time must be later than start time',
        400,
        'INVALID_TIME_RANGE'
      );
    }

    const durationMinutes = (endMs - startMs) / (1000 * 60);

    if (durationMinutes < 15 || durationMinutes > 8 * 60) {
      throw new AppError(
        'Reservation duration must be between 15 minutes and 8 hours',
        400,
        'INVALID_DURATION'
      );
    }

    return this.reservationsRepository.createWithRoomLock({
      roomId,
      title,
      startTime,
      endTime
    });
  }


  async cancelReservation(id) {
    const reservation = await this.reservationsRepository.findById(id);

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (reservation.status === 'CANCELLED') {
      return reservation;
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new ConflictError(
        'Only confirmed reservations can be cancelled',
        'INVALID_STATE_TRANSITION'
      );
    }

    if (new Date(reservation.startTime).getTime() <= this.now().getTime()) {
      throw new ConflictError(
        'Cannot cancel a reservation that has already started',
        'RESERVATION_ALREADY_STARTED'
      );
    }

    return this.reservationsRepository.updateStatus(id, 'CANCELLED');
  }
}

module.exports = ReservationsService;
