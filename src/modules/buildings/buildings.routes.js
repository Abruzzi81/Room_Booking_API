
const { Router } = require('express');
const BuildingsRepositoryKnex = require('./buildings.repository.knex');
const RoomsRepositoryKnex = require('../rooms/rooms.repository.knex');
const BuildingsService = require('./buildings.service');
const BuildingsController = require('./buildings.controller');
const validate = require('../../middleware/validate');
const {
  createBuildingSchema,
  getBuildingByIdSchema
} = require('./buildings.schemas');
const db = require('../../db');

const router = Router();

const buildingsRepository = new BuildingsRepositoryKnex(db);
const buildingsService = new BuildingsService(
  buildingsRepository,
  RoomsRepositoryKnex
);
const buildingsController = new BuildingsController(buildingsService);

router.get('/', buildingsController.getBuildings);
router.get(
  '/:id/rooms',
  validate(getBuildingByIdSchema),
  buildingsController.getBuildingRooms
);
router.get(
  '/:id',
  validate(getBuildingByIdSchema),
  buildingsController.getBuildingById
);
router.post(
  '/',
  validate(createBuildingSchema),
  buildingsController.createBuilding
);

module.exports = router;
