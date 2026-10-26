const { Router } = require('express');
const BuildingsRepositoryKnex = require('./buildings.repository.knex');
const BuildingsService = require('./buildings.service');
const BuildingsController = require('./buildings.controller');
const validate = require('../../middleware/validate');
const { createBuildingSchema, getBuildingByIdSchema } = require('./buildings.schemas');
const db = require('../../db'); // Dostosuj ścieżkę do swojego pliku konfiguracyjnego Knex/DB

const router = Router();

// Wstrzykiwanie zależności (Dependency Injection)
const buildingsRepository = new BuildingsRepositoryKnex(db);
const buildingsService = new BuildingsService(buildingsRepository);
const buildingsController = new BuildingsController(buildingsService);

router.get('/', buildingsController.getBuildings);
router.get('/:id', validate(getBuildingByIdSchema), buildingsController.getBuildingById);
router.post('/', validate(createBuildingSchema), buildingsController.createBuilding);

module.exports = router;