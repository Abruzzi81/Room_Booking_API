class BuildingsRepositoryKnex {
  constructor(db) {
    this.db = db;
  }

async findAll() {
    return await this.db('buildings')
      .select('buildings.id', 'buildings.name', 'buildings.address', 'buildings.created_at', 'buildings.updated_at')
      .count('rooms.id as rooms_count')
      .leftJoin('rooms', 'buildings.id', '=', 'rooms.building_id')
      .groupBy('buildings.id');
  }

  async findById(id) {
    const building = await this.db('buildings')
      .where({ 'buildings.id': id })
      .first();
    return building || null;
  }

  async create(buildingData) {
    const [created] = await this.db('buildings')
      .insert({
        name: buildingData.name,
        address: buildingData.address,
      })
      .returning('*');
    return created;
  }
}

module.exports = BuildingsRepositoryKnex;