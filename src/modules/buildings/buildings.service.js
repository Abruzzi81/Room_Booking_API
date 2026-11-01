const NotFoundError = require('../../errors/not-found.error');
const ConflictError = require('../../errors/conflict.error');

class BuildingsService {
  constructor(buildingsRepository, roomsRepository) {
    this.buildingsRepository = buildingsRepository;
    this.roomsRepository = roomsRepository;
  }

  async getAllBuildings() { return this.buildingsRepository.findAll(); }

  async getBuildingById(id) {
    const building = await this.buildingsRepository.findById(id);
    if (!building) throw new NotFoundError('Building not found');
    return building;
  }

  async getBuildingRooms(id) {
    await this.getBuildingById(id);
    return this.roomsRepository.findByBuildingId(id);
  }

  async createBuilding(data) { return this.buildingsRepository.create(data); }

  async updateBuilding(id, data) {
    await this.getBuildingById(id);
    return this.buildingsRepository.update(id, data);
  }

  async deleteBuilding(id) {
    await this.getBuildingById(id);
    try {
      await this.buildingsRepository.delete(id);
    } catch (error) {
      if (error.code === '23503') {
        throw new ConflictError('Nie można usunąć budynku, ponieważ jego sale mają rezerwacje', 'BUILDING_HAS_RESERVATIONS');
      }
      throw error;
    }
  }
}

module.exports = BuildingsService;
