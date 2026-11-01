const { Router } = require('express');
const BuildingsRepositoryKnex = require('./buildings.repository.knex');
const RoomsRepositoryKnex = require('../rooms/rooms.repository.knex');
const BuildingsService = require('./buildings.service');
const BuildingsController = require('./buildings.controller');
const validate = require('../../middleware/validate');
const { authorize } = require('../../middleware/auth.middleware');
const { createBuildingSchema, updateBuildingSchema, getBuildingByIdSchema } = require('./buildings.schemas');
const db = require('../../db');

const router = Router();
const repository = new BuildingsRepositoryKnex(db);
const service = new BuildingsService(repository, RoomsRepositoryKnex);
const controller = new BuildingsController(service);

router.get('/', controller.getBuildings);
router.get('/:id/rooms', validate(getBuildingByIdSchema), controller.getBuildingRooms);
router.get('/:id', validate(getBuildingByIdSchema), controller.getBuildingById);
router.post('/', authorize('ADMIN'), validate(createBuildingSchema), controller.createBuilding);
router.patch('/:id', authorize('ADMIN'), validate(updateBuildingSchema), controller.updateBuilding);
router.delete('/:id', authorize('ADMIN'), validate(getBuildingByIdSchema), controller.deleteBuilding);

module.exports = router;
