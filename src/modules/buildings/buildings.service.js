
const NotFoundError = require('../../errors/not-found.error');

class BuildingsService {
  constructor(buildingsRepository, roomsRepository) {
    this.buildingsRepository = buildingsRepository;
    this.roomsRepository = roomsRepository;
  }

  async getAllBuildings() {
    return await this.buildingsRepository.findAll();
  }

  async getBuildingById(id) {
    const building = await this.buildingsRepository.findById(id);

    if (!building) {
      throw new NotFoundError('Building not found');
    }

    return building;
  }

  async getBuildingRooms(id) {
    // Najpierw sprawdzamy, czy budynek istnieje.
    await this.getBuildingById(id);

    // Dla istniejącego budynku bez sal repozytorium zwróci [].
    return await this.roomsRepository.findByBuildingId(id);
  }

  async createBuilding(buildingData) {
    return await this.buildingsRepository.create(buildingData);
  }
}

module.exports = BuildingsService;
