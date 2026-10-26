function toRoomResponse(room) {
  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    buildingId: room.buildingId || room.building_id,
    // Jeśli w zapytaniu SQL robisz JOIN z tabelą buildings, możesz dołączyć obiekt budynku:
    building: room.room_name || room.building_name ? {
      name: room.room_name || room.building_name,
      capacity: room.room_capacity
    } : undefined,
    createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : (room.created_at ? new Date(room.created_at).toISOString() : undefined),
    updatedAt: room.updatedAt ? new Date(room.updatedAt).toISOString() : (room.updated_at ? new Date(room.updated_at).toISOString() : undefined)
  };
}

module.exports = {
  toRoomResponse
};