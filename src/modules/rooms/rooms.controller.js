const { toRoomResponse, toRoomsListResponse } = require('./rooms.mapper');

class RoomsController {
  constructor(service) { this.roomsService = service; }

  getRooms = async (req, res, next) => {
    try { res.status(200).json(toRoomsListResponse(await this.roomsService.getAllRooms())); }
    catch (error) { next(error); }
  };

  getRoomById = async (req, res, next) => {
    try { res.status(200).json(toRoomResponse(await this.roomsService.getRoomById(req.validated.params.id))); }
    catch (error) { next(error); }
  };

  createRoom = async (req, res, next) => {
    try { res.status(201).json(toRoomResponse(await this.roomsService.create(req.validated.body))); }
    catch (error) { next(error); }
  };

  updateRoom = async (req, res, next) => {
    try { res.status(200).json(toRoomResponse(await this.roomsService.update(req.validated.params.id, req.validated.body))); }
    catch (error) { next(error); }
  };

  deleteRoom = async (req, res, next) => {
    try { await this.roomsService.delete(req.validated.params.id); res.status(204).send(); }
    catch (error) { next(error); }
  };
}

module.exports = RoomsController;
