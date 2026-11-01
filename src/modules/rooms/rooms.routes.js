const { Router } = require('express');
const roomsRepository = require('./rooms.repository.knex');
const RoomsService = require('./rooms.service');
const RoomsController = require('./rooms.controller');
const validate = require('../../middleware/validate');
const { authorize } = require('../../middleware/auth.middleware');
const { createRoomSchema, updateRoomSchema, getRoomsSchema, roomIdParamSchema } = require('./rooms.schemas');

const router = Router();
const service = new RoomsService(roomsRepository);
const controller = new RoomsController(service);

router.get('/', validate(getRoomsSchema), controller.getRooms);
router.get('/:id', validate(roomIdParamSchema), controller.getRoomById);
router.post('/', authorize('ADMIN'), validate(createRoomSchema), controller.createRoom);
router.patch('/:id', authorize('ADMIN'), validate(updateRoomSchema), controller.updateRoom);
router.delete('/:id', authorize('ADMIN'), validate(roomIdParamSchema), controller.deleteRoom);

module.exports = router;
