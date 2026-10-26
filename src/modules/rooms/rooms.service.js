class RoomsService {
  constructor(roomsRepository) {
    this.roomsRepository = roomsRepository; // Dependency Injection
  }

  async getAllRooms() {
    return await this.roomsRepository.findAll();
  }

  async getRoomById(id) {
    const room = await this.roomsRepository.findById(id);
    if (!room) {
      const error = new Error("Room not found");
      error.status = 404;
      throw error;
    }
    return room;
  }

  async create(roomData) {
    return await this.roomsRepository.create(roomData);
  }
}

module.exports = RoomsService;