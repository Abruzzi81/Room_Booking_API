const { Router } = require('express');
const RoomsRepositoryMemory = require('./rooms.repository.memory');
const RoomsService = require('./rooms.service');
const RoomsController = require('./rooms.controller');

const router = Router();

// Inicjalizacja instancji (w pełnej aplikacji można to robić też w server.js lub przez kontener)
const roomsRepository = new RoomsRepositoryMemory();
const roomsService = new RoomsService(roomsRepository);
const roomsController = new RoomsController(roomsService);

router.get('/', roomsController.getRooms);
router.get('/:id', roomsController.getRoomById);

module.exports = router;