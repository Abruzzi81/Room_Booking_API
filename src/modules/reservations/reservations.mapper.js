function toReservationResponse(reservation) {
  if (!reservation) return null;

  const startTime = reservation.startTime ?? reservation.start_time;
  const endTime = reservation.endTime ?? reservation.end_time;
  const createdAt = reservation.createdAt ?? reservation.created_at;
  const updatedAt = reservation.updatedAt ?? reservation.updated_at;

  return {
    id: reservation.id,
    roomId: reservation.roomId ?? reservation.room_id,
    title: reservation.title,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    status: reservation.status,
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null
  };
}

module.exports = { toReservationResponse };
