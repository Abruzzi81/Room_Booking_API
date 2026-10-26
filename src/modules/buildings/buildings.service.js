const NotFoundError = require('../../errors/not-found.error');

class BuildingsService {
  constructor(buildingsRepository) {
    this.buildingsRepository = buildingsRepository;
  }

  async getAllBuildings() {
    return await this.buildingsRepository.findAll();
  }

  async getBuildingById(id) {
    const building = await this.buildingsRepository.findById(id);
    if (!building) {
      throw new NotFoundError("Building not found");
    }
    return building;
  }

  async createBuilding(buildingData) {
    return await this.buildingsRepository.create(buildingData);
  }
}

module.exports = BuildingsService;