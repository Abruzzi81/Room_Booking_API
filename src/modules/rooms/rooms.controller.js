class RoomsController {
  constructor(roomsService) {
    this.roomsService = roomsService;
  }

  getRooms = async (req, res, next) => {
    try {
      const rooms = await this.roomsService.getAllRooms();
      res.status(200).json(rooms);
    } catch (err) {
      next(err);
    }
  };

  getRoomById = async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.id, 10);
      const room = await this.roomsService.getRoomById(roomId);
      res.status(200).json(room);
    } catch (err) {
      next(err);
    }
  };

  createRoom = async (req, res, next) => {
    try {
      const newRoom = await this.roomsService.create(req.body);
      res.status(201).json(newRoom);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = RoomsController;