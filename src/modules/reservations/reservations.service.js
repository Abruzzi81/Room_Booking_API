const ConflictError = require('../../errors/conflict.error');
const AppError = require('../../errors/app.error');

class ReservationsService {
  constructor(reservationsRepository, roomsRepository, now = () => new Date()) {
    this.reservationsRepository = reservationsRepository;
    this.roomsRepository = roomsRepository;
    this.now = now; // Wstrzykiwanie aktualnego czasu (wymóg Zadania 4)
  }

  async getAllReservations(roomIdQuery) {
    if (roomIdQuery !== undefined) {
      const roomId = parseInt(roomIdQuery, 10);
      return await this.reservationsRepository.findByRoomId(roomId);
    }
    return await this.reservationsRepository.findAll();
  }

  async createReservation(data) {
    const { roomId, participants, startTime, endTime } = data;

    // 1. Sprawdzenie czy sala istnieje
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404, "NOT_FOUND");
    }

    // 2. Reguła pojemności sali
    if (participants > room.capacity) {
      throw new ConflictError("Room capacity exceeded", "ROOM_CAPACITY_EXCEEDED");
    }

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const currentTime = this.now().getTime();

    // 3. startTime nie może być w przeszłości[cite: 6]
    if (startMs < currentTime) {
      throw new AppError("Start time cannot be in the past", 400, "INVALID_START_TIME");
    }

    // 4. endTime musi być późniejsze niż startTime[cite: 6]
    if (endMs <= startMs) {
      throw new AppError("End time must be later than start time", 400, "INVALID_TIME_RANGE");
    }

    // 5. Czas trwania: minimum 15 minut, maksimum 8 godzin[cite: 6]
    const durationMinutes = (endMs - startMs) / (1000 * 60);
    if (durationMinutes < 15 || durationMinutes > 8 * 60) {
      throw new AppError("Reservation duration must be between 15 minutes and 8 hours", 400, "INVALID_DURATION");
    }

    // 6. Sprawdzenie nakładania się rezerwacji dla danej sali
    const existingReservations = await this.reservationsRepository.findByRoomId(roomId);
    
    // Bierzemy pod uwagę tylko aktywne rezerwacje (CONFIRMED)
    const activeReservations = existingReservations.filter(r => r.status === 'CONFIRMED');

    for (const existing of activeReservations) {
      const existingStart = new Date(existing.startTime).getTime();
      const existingEnd = new Date(existing.endTime).getTime();

      // Warunek nakładania się przedziałów półotwartych [startTime, endTime)[cite: 5]
      // A.start < B.end AND B.start < A.end
      if (startMs < existingEnd && existingStart < endMs) {
        throw new ConflictError("Room is already booked for this time period", "ROOM_ALREADY_BOOKED");
      }
    }

    return await this.reservationsRepository.create(data);
  }

  async cancelReservation(id) {
    const reservation = await this.reservationsRepository.findById(id);
    
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    // 1. Sprawdzenie maszyny stanów: czy status pozwala na anulowanie
    if (reservation.status === 'CANCELLED') {
      // Idempotencja lub błąd – w zależności od preferencji, tutaj zwracamy aktualną
      return reservation; 
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new ConflictError("Only confirmed reservations can be cancelled", "INVALID_STATE_TRANSITION");
    }

    // 2. Walidacja czasu: czy rezerwacja już się rozpoczęła?
    const startTimeMs = new Date(reservation.startTime).getTime();
    const currentTimeMs = this.now().getTime();

    if (startTimeMs <= currentTimeMs) {
      throw new ConflictError("Cannot cancel a reservation that has already started", "RESERVATION_ALREADY_STARTED");
    }

    // 3. Wykonanie przejścia stanu
    const cancelledAt = this.now().toISOString();
    const updated = await this.reservationsRepository.updateStatus(id, 'CANCELLED', cancelledAt);

    return updated;
  }
}

module.exports = ReservationsService;