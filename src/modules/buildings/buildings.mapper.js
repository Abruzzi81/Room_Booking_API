const toBuildingResponse = (building) => {
  if (!building) return null;
  return {
    id: building.id,
    name: building.name,
    address: building.address,
    createdAt: building.created_at || building.createdAt,
    // Obsługa pola roomsCount (wymagana w zadaniu 3)
    ...(building.rooms_count !== undefined && { roomsCount: Number(building.rooms_count) }),
    ...(building.roomsCount !== undefined && { roomsCount: Number(building.roomsCount) }),
  };
};

const toBuildingsListResponse = (buildings) => {
  return buildings.map(toBuildingResponse);
};

module.exports = {
  toBuildingResponse,
  toBuildingsListResponse,
};