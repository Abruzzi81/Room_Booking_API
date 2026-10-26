const { Router } = require('express');
const roomsRepository = require('./rooms.repository.knex');
const RoomsService = require('./rooms.service');
const RoomsController = require('./rooms.controller');
const validate = require('../../middleware/validate');
const { 
  createRoomSchema, 
  getRoomsSchema, 
  roomIdParamSchema 
} = require('./rooms.schemas');                     
const router = Router();

const roomsService = new RoomsService(roomsRepository);
const roomsController = new RoomsController(roomsService);

router.get('/', validate(getRoomsSchema), roomsController.getRooms);
router.get('/:id', validate(roomIdParamSchema), roomsController.getRoomById);
router.post('/', validate(createRoomSchema), roomsController.createRoom);

module.exports = router;