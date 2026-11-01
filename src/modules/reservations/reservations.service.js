
const ConflictError = require('../../errors/conflict.error');
const AppError = require('../../errors/app.error');
const NotFoundError = require('../../errors/not-found.error');

class ReservationsService {
  constructor(reservationsRepository, roomsRepository, now = () => new Date()) {
    this.reservationsRepository = reservationsRepository;
    this.roomsRepository = roomsRepository;
    this.now = now;
  }

  async getAllReservations(query = {}, currentUser) {
    if (currentUser.role === 'USER' && query.userId !== undefined) {
      throw new AppError(
        'USER cannot filter reservations by userId',
        403,
        'FORBIDDEN'
      );
    }

    const filters = { ...query };

    if (currentUser.role === 'USER') {
      filters.userId = Number(currentUser.id);
    }

    return this.reservationsRepository.findPage(filters);
  }

  async getReservationById(id, currentUser) {
    const reservation =
      await this.reservationsRepository.findByIdWithRoomAndBuilding(id);

    if (
      !reservation ||
      (
        currentUser.role !== 'ADMIN' &&
        Number(reservation.userId) !== Number(currentUser.id)
      )
    ) {
      throw new NotFoundError('Reservation not found');
    }

    return reservation;
  }

  async createReservation(data, userId) {
    const room = await this.roomsRepository.findById(data.roomId);

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      startTime >= endTime
    ) {
      throw new AppError(
        'Invalid reservation time range',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (startTime <= this.now()) {
      throw new AppError(
        'Reservation must start in the future',
        400,
        'VALIDATION_ERROR'
      );
    }

    return this.reservationsRepository.createWithRoomLock({
      roomId: data.roomId,
      userId: Number(userId),
      title: data.title,
      startTime,
      endTime
    });
  }

  async cancelReservation(id, currentUser) {
    const reservation = await this.reservationsRepository.findById(id);

    if (
      !reservation ||
      (
        currentUser.role !== 'ADMIN' &&
        Number(reservation.userId) !== Number(currentUser.id)
      )
    ) {
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
