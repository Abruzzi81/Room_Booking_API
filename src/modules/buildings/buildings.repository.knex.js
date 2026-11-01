class BuildingsRepositoryKnex {
  constructor(db) { this.db = db; }

  async findAll() {
    return this.db('buildings')
      .select('buildings.id', 'buildings.name', 'buildings.address', 'buildings.created_at', 'buildings.updated_at')
      .count('rooms.id as rooms_count')
      .leftJoin('rooms', 'buildings.id', '=', 'rooms.building_id')
      .groupBy('buildings.id');
  }

  async findById(id) {
    return (await this.db('buildings').where({ id }).first()) || null;
  }

  async create(data) {
    const [created] = await this.db('buildings')
      .insert({ name: data.name, address: data.address }).returning('*');
    return created;
  }

  async update(id, data) {
    const [updated] = await this.db('buildings').where({ id })
      .update({ ...data, updated_at: this.db.fn.now() }).returning('*');
    return updated || null;
  }

  async delete(id) {
    const deleted = await this.db('buildings').where({ id }).del();
    return deleted > 0;
  }
}

module.exports = BuildingsRepositoryKnex;
