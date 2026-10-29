const toBuildingResponse = (building) => {
  if (!building) return null;
  return {
    id: building.id,
    name: building.name,
    address: building.address,
    createdAt: building.created_at || building.createdAt,
    roomsCount: Number(building.rooms_count ?? building.roomsCount ?? 0)
  };
};

const toBuildingsListResponse = (buildings) => {
  return buildings.map(toBuildingResponse);
};

module.exports = {
  toBuildingResponse,
  toBuildingsListResponse,
};