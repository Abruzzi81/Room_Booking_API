const db = require('../../db');

class ReservationsRepositoryKnex {
  async findAll() {
    return await db('reservations')
      .join('rooms', 'reservations.room_id', '=', 'rooms.id')
      .select(
        'reservations.id as id',
        'reservations.room_id as roomId',
        'reservations.title as title',
        'reservations.start_time as startTime',
        'reservations.end_time as endTime',
        'reservations.status as status',
        'reservations.created_at as createdAt',
        'reservations.updated_at as updatedAt',
        'rooms.name as room_name',
        'rooms.capacity as room_capacity'
      );
  }

  async findById(id) {
    const reservation = await db('reservations')
      .where('reservations.id', id)
      .join('rooms', 'reservations.room_id', '=', 'rooms.id')
      .select(
        'reservations.id as id',
        'reservations.room_id as roomId',
        'reservations.title as title',
        'reservations.start_time as startTime',
        'reservations.end_time as endTime',
        'reservations.status as status',
        'reservations.created_at as createdAt',
        'reservations.updated_at as updatedAt',
        'rooms.name as room_name',
        'rooms.capacity as room_capacity'
      )
      .first();

    return reservation || null;
  }

  async findByRoomId(roomId) {
    return await db('reservations')
      .where('reservations.room_id', roomId)
      .join('rooms', 'reservations.room_id', '=', 'rooms.id')
      .select(
        'reservations.id as id',
        'reservations.room_id as roomId',
        'reservations.title as title',
        'reservations.start_time as startTime',
        'reservations.end_time as endTime',
        'reservations.status as status',
        'reservations.created_at as createdAt',
        'reservations.updated_at as updatedAt'
      );
  }

  // Kluczowa metoda do wykrywania nakładania się rezerwacji w tej samej sali
  async findConflicting(roomId, startTime, endTime, excludeId = null) {
    const query = db('reservations')
      .where('room_id', roomId)
      .andWhere('status', '!=', 'CANCELLED') // Anulowane rezerwacje nie blokują terminów
      .andWhere(function() {
        // Warunek nakładania się przedziałów czasowych: (StartA < EndB) AND (EndA > StartB)
        this.where('start_time', '<', endTime)
            .andWhere('end_time', '>', startTime);
      });

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    return await query.first();
  }

  async create(reservationData) {
    const [newReservation] = await db('reservations')
      .insert({
        room_id: reservationData.roomId || reservationData.room_id,
        title: reservationData.title,
        start_time: reservationData.startTime || reservationData.start_time,
        end_time: reservationData.endTime || reservationData.end_time,
        status: reservationData.status || 'CONFIRMED'
      })
      .returning('*');

    return {
      id: newReservation.id,
      roomId: newReservation.room_id,
      title: newReservation.title,
      startTime: newReservation.start_time,
      endTime: newReservation.end_time,
      status: newReservation.status,
      createdAt: newReservation.created_at,
      updatedAt: newReservation.updated_at
    };
  }

  async updateStatus(id, status) {
    const updateData = {
      status: status,
      updated_at: db.fn.now()
    };

    const [updated] = await db('reservations')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!updated) return null;

    return {
      id: updated.id,
      roomId: updated.room_id,
      title: updated.title,
      startTime: updated.start_time,
      endTime: updated.end_time,
      status: updated.status,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };
  }
}

module.exports = new ReservationsRepositoryKnex();