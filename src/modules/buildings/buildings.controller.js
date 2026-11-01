const { toBuildingResponse, toBuildingsListResponse } = require('./buildings.mapper');

class BuildingsController {
  constructor(service) { this.buildingsService = service; }

  getBuildings = async (req, res, next) => {
    try { res.status(200).json(toBuildingsListResponse(await this.buildingsService.getAllBuildings())); }
    catch (error) { next(error); }
  };

  getBuildingById = async (req, res, next) => {
    try { res.status(200).json(toBuildingResponse(await this.buildingsService.getBuildingById(req.validated.params.id))); }
    catch (error) { next(error); }
  };

  createBuilding = async (req, res, next) => {
    try { res.status(201).json(toBuildingResponse(await this.buildingsService.createBuilding(req.validated.body))); }
    catch (error) { next(error); }
  };

  updateBuilding = async (req, res, next) => {
    try { res.status(200).json(toBuildingResponse(await this.buildingsService.updateBuilding(req.validated.params.id, req.validated.body))); }
    catch (error) { next(error); }
  };

  deleteBuilding = async (req, res, next) => {
    try { await this.buildingsService.deleteBuilding(req.validated.params.id); res.status(204).send(); }
    catch (error) { next(error); }
  };

  getBuildingRooms = async (req, res, next) => {
    try { res.status(200).json(await this.buildingsService.getBuildingRooms(req.validated.params.id)); }
    catch (error) { next(error); }
  };
}

module.exports = BuildingsController;
