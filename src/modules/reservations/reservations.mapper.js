function toReservationResponse(reservation) {
  if (!reservation) return null;

  return {
    id: reservation.id,
    roomId: reservation.roomId,
    reservedBy: reservation.reservedBy,
    participants: reservation.participants,
    startTime: new Date(reservation.startTime).toISOString(), // Zawsze format UTC (...Z)
    endTime: new Date(reservation.endTime).toISOString(),     // Zawsze format UTC (...Z)
    status: reservation.status,
    createdAt: new Date(reservation.createdAt).toISOString(),
    cancelledAt: reservation.cancelledAt ? new Date(reservation.cancelledAt).toISOString() : null
    // Pole `internalNote` zostaje automatycznie odsiane (brak w zwracanym obiekcie)
  };
}

module.exports = {
  toReservationResponse
};