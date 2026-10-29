function toRoomResponse(room) {
  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    building: (room.building_id || room.buildingId) ? {
      id: room.building_id || room.buildingId,
      name: room.building_name || room.buildingName
    } : undefined,
    createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : (room.created_at ? new Date(room.created_at).toISOString() : undefined),
    updatedAt: room.updatedAt ? new Date(room.updatedAt).toISOString() : (room.updated_at ? new Date(room.updated_at).toISOString() : undefined)
  };
}

const toRoomsListResponse = (rooms) => {
  return rooms.map(toRoomResponse);
};

module.exports = {
  toRoomResponse,
  toRoomsListResponse
};