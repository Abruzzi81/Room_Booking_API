const db = require('../../db');

class RoomsRepositoryKnex {
    // Pobieranie sali wraz z budynkiem w 1 zapytaniu SQL (bez N+1)
    async findByIdWithBuilding(id) {
        const room = await db('rooms')
            .where('rooms.id', id)
            .join('buildings', 'rooms.building_id', '=', 'buildings.id')
            .select(
                'rooms.id as id',
                'rooms.name as name',
                'rooms.capacity as capacity',
                'rooms.created_at as createdAt',
                'rooms.updated_at as updatedAt',
                'buildings.id as building_id',
                'buildings.name as building_name'
            )
            .first();

        return room || null;
    }

    async findByBuildingId(buildingId) {
        const rooms = await db('rooms')
            .where('rooms.building_id', buildingId)
            .select('id', 'building_id as buildingId', 'name', 'capacity', 'created_at as createdAt', 'updated_at as updatedAt');

        return rooms;
    }

    async findById(id) {
        const room = await db('rooms')
            .where('id', id)
            .select('id', 'building_id as buildingId', 'name', 'capacity', 'created_at as createdAt', 'updated_at as updatedAt')
            .first();

        return room || null;
    }

    async findAll() {
        const rooms = await db('rooms')
            .join('buildings', 'rooms.building_id', '=', 'buildings.id')
            .select(
                'rooms.id as id',
                'rooms.name as name',
                'rooms.capacity as capacity',
                'rooms.created_at as createdAt',
                'rooms.updated_at as updatedAt',
                'buildings.id as building_id',
                'buildings.name as building_name'
            );

        return rooms;
    }

    async create(roomData) {
        const [created] = await db('rooms')
            .insert({
                name: roomData.name,
                capacity: roomData.capacity,
                building_id: roomData.buildingId
            })
            .returning('*');

        return {
            id: created.id,
            name: created.name,
            capacity: created.capacity,
            buildingId: created.building_id
        };
    }
}

module.exports = new RoomsRepositoryKnex();