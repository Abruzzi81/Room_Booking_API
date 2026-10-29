const { toBuildingResponse, toBuildingsListResponse } = require('./buildings.mapper');

class BuildingsController {
  constructor(buildingsService) {
    this.buildingsService = buildingsService;
  }

  getBuildings = async (req, res, next) => {
    try {
      const buildings = await this.buildingsService.getAllBuildings();
      res.json(toBuildingsListResponse(buildings));
    } catch (error) {
      next(error);
    }
  };

  getBuildingById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const building = await this.buildingsService.getBuildingById(id);
      res.json(toBuildingResponse(building));
    } catch (error) {
      next(error);
    }
  };

  createBuilding = async (req, res, next) => {
    try {
      const newBuilding = await this.buildingsService.createBuilding(req.body);
      res.status(201).json(toBuildingResponse(newBuilding));
    } catch (error) {
      next(error);
    }
  };

  
  getBuildingRooms = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const rooms = await this.buildingsService.getBuildingRooms(id);
      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  };

}

module.exports = BuildingsController;