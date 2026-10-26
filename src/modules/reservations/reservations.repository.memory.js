class ReservationsRepositoryMemory {
    constructor() {
        this.reservations = [
            // Przykładowa rezerwacja z przeszłości
            {
                id: 99,
                roomId: 1,
                reservedBy: "Test Historyczny",
                participants: 2,
                startTime: "2025-01-01T10:00:00.000Z",
                endTime: "2025-01-01T12:00:00.000Z",
                status: 'CONFIRMED',
                createdAt: "2025-01-01T09:00:00.000Z",
                cancelledAt: null,
                internalNote: "Przeszła rezerwacja do testu"
            }
        ];
        this.nextId = 1;
    }

    async findAll() {
        return this.reservations;
    }

    async findByRoomId(roomId) {
        return this.reservations.filter(r => r.roomId === roomId);
    }

    async findById(id) {
        return this.reservations.find(r => r.id === id) || null;
    }

    async create(reservationData) {
        const newReservation = {
            id: this.nextId++,
            ...reservationData,
            status: reservationData.status || 'CONFIRMED', // <-- Jawne ustawienie statusu!
            createdAt: new Date().toISOString(),
            cancelledAt: null
        };
        this.reservations.push(newReservation);
        return newReservation;
    }

    async updateStatus(id, status, cancelledAt = null) {
        const reservation = await this.findById(id);
        if (!reservation) return null;

        reservation.status = status;
        if (cancelledAt) {
            reservation.cancelledAt = cancelledAt;
        }
        return reservation;
    }
}

module.exports = ReservationsRepositoryMemory;