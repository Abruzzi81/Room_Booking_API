const db = require('../../db');

class RoomsRepositoryKnex {
  async findAll() {
    return await db('rooms')
      .join('buildings', 'rooms.building_id', '=', 'buildings.id')
      .select(
        'rooms.id as id',
        'rooms.name as name',
        'rooms.capacity as capacity',
        'rooms.building_id as buildingId',
        'rooms.created_at as createdAt',
        'rooms.updated_at as updatedAt',
        'buildings.id as building_id_ref',
        'buildings.name as building_name',
        'buildings.address as building_address'
      );
  }

  async findById(id) {
    const room = await db('rooms')
      .where('rooms.id', id)
      .join('buildings', 'rooms.building_id', '=', 'buildings.id')
      .select(
        'rooms.id as id',
        'rooms.name as name',
        'rooms.capacity as capacity',
        'rooms.building_id as buildingId',
        'rooms.created_at as createdAt',
        'rooms.updated_at as updatedAt',
        'buildings.id as building_id_ref',
        'buildings.name as building_name',
        'buildings.address as building_address'
      )
      .first();

    return room || null;
  }

  async create(roomData) {
    const [newRoom] = await db('rooms')
      .insert({
        building_id: roomData.buildingId || roomData.building_id,
        name: roomData.name,
        capacity: roomData.capacity
      })
      .returning('*');

    return newRoom;
  }

  async update(id, roomData) {
    const updateData = {};
    if (roomData.name !== undefined) updateData.name = roomData.name;
    if (roomData.capacity !== undefined) updateData.capacity = roomData.capacity;
    if (roomData.buildingId !== undefined) updateData.building_id = roomData.buildingId;
    updateData.updated_at = db.fn.now();

    const [updatedRoom] = await db('rooms')
      .where({ id })
      .update(updateData)
      .returning('*');

    return updatedRoom || null;
  }

  async delete(id) {
    const deletedCount = await db('rooms').where({ id }).del();
    return deletedCount > 0;
  }
}

module.exports = new RoomsRepositoryKnex();