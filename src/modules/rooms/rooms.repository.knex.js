const db = require('../../db');

class RoomsRepositoryKnex {
  async findByIdWithBuilding(id) {
    return (await db('rooms').where('rooms.id', id)
      .join('buildings', 'rooms.building_id', '=', 'buildings.id')
      .select('rooms.id as id', 'rooms.name as name', 'rooms.capacity as capacity',
        'rooms.created_at as createdAt', 'rooms.updated_at as updatedAt',
        'buildings.id as building_id', 'buildings.name as building_name').first()) || null;
  }

  async findByBuildingId(buildingId) {
    return db('rooms').where('rooms.building_id', buildingId)
      .select('id', 'building_id as buildingId', 'name', 'capacity', 'created_at as createdAt', 'updated_at as updatedAt');
  }

  async findById(id) {
    return (await db('rooms').where('id', id)
      .select('id', 'building_id as buildingId', 'name', 'capacity', 'created_at as createdAt', 'updated_at as updatedAt').first()) || null;
  }

  async findAll() {
    return db('rooms').join('buildings', 'rooms.building_id', '=', 'buildings.id')
      .select('rooms.id as id', 'rooms.name as name', 'rooms.capacity as capacity',
        'rooms.created_at as createdAt', 'rooms.updated_at as updatedAt',
        'buildings.id as building_id', 'buildings.name as building_name');
  }

  async create(data) {
    const [created] = await db('rooms').insert({
      name: data.name, capacity: data.capacity, building_id: data.buildingId,
    }).returning('*');
    return { id: created.id, name: created.name, capacity: created.capacity, buildingId: created.building_id };
  }

  async update(id, data) {
    const values = { ...data };
    if (values.buildingId !== undefined) {
      values.building_id = values.buildingId;
      delete values.buildingId;
    }
    const [updated] = await db('rooms').where({ id })
      .update({ ...values, updated_at: db.fn.now() }).returning('*');
    return updated ? { id: updated.id, name: updated.name, capacity: updated.capacity, buildingId: updated.building_id, createdAt: updated.created_at, updatedAt: updated.updated_at } : null;
  }

  async delete(id) {
    return (await db('rooms').where({ id }).del()) > 0;
  }
}

module.exports = new RoomsRepositoryKnex();
