const NotFoundError = require('../../errors/not-found.error');
const ConflictError = require('../../errors/conflict.error');

class RoomsService {
  constructor(roomsRepository) { this.roomsRepository = roomsRepository; }

  async getAllRooms() { return this.roomsRepository.findAll(); }

  async getRoomById(id) {
    const room = await this.roomsRepository.findByIdWithBuilding(id);
    if (!room) throw new NotFoundError('Room not found');
    return room;
  }

  async create(data) { return this.roomsRepository.create(data); }

  async update(id, data) {
    await this.getRoomById(id);
    return this.roomsRepository.update(id, data);
  }

  async delete(id) {
    await this.getRoomById(id);
    try {
      await this.roomsRepository.delete(id);
    } catch (error) {
      if (error.code === '23503') {
        throw new ConflictError('Nie można usunąć sali, ponieważ ma przypisane rezerwacje', 'ROOM_HAS_RESERVATIONS');
      }
      throw error;
    }
  }
}

module.exports = RoomsService;
