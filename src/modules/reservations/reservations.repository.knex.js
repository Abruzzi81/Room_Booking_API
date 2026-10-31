const db = require('../../db');
const ValidationError = require('../../errors/validation.error');
const ConflictError = require('../../errors/conflict.error');
const NotFoundError = require('../../errors/not-found.error');

function mapReservation(row) {
    if (!row) return null;

    return {
        id: row.id,
        roomId: row.room_id ?? row.roomId,
        title: row.title,
        startTime: row.start_time ?? row.startTime,
        endTime: row.end_time ?? row.endTime,
        status: row.status,
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
        user: row.user_email
            ? {
                id: row.user_id,
                email: row.user_email
            }
            : null
    };
}

class ReservationsRepositoryKnex {
    async findAll() {
        const rows = await db('reservations as r')
            .join('users as u', 'r.user_id', 'u.id')
            .select(
                'r.id',
                'r.room_id',
                'r.title',
                'r.start_time',
                'r.end_time',
                'r.status',
                'r.created_at',
                'r.updated_at',
                'u.id as user_id',
                'u.email as user_email'
            )
            .orderBy('r.start_time', 'asc');

        return rows.map(mapReservation);
    }

    async findById(id) {
        const row = await db('reservations as r')
            .join('users as u', 'r.user_id', 'u.id')
            .where('r.id', id)
            .select(
                'r.*',
                'u.id as user_id',
                'u.email as user_email'
            )
            .first();

        return mapReservation(row);
    }


    async findByIdWithRoomAndBuilding(id) {
        const row = await db('reservations as r')
            .join('rooms as rm', 'r.room_id', 'rm.id')
            .join('buildings as b', 'rm.building_id', 'b.id')
            .join('users as u', 'r.user_id', 'u.id')
            .where('r.id', id)
            .select(
                'r.id as id',
                'r.room_id as roomId',
                'r.title as title',
                'r.start_time as startTime',
                'r.end_time as endTime',
                'r.status as status',
                'r.created_at as createdAt',
                'r.updated_at as updatedAt',

                'u.id as user_id',
                'u.email as user_email',

                'rm.id as room_id',
                'rm.name as room_name',
                'rm.capacity as room_capacity',

                'b.id as building_id',
                'b.name as building_name',
                'b.address as building_address'
            )
            .first();

        if (!row) return null;

        return {
            id: row.id,
            roomId: row.roomId,
            title: row.title,
            startTime: row.startTime,
            endTime: row.endTime,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,

            user: {
                id: row.user_id,
                email: row.user_email
            },

            room: {
                id: row.room_id,
                name: row.room_name,
                capacity: row.room_capacity,
                building: {
                    id: row.building_id,
                    name: row.building_name,
                    address: row.building_address
                }
            }
        };
    }


    async findByRoomId(roomId) {
        const rows = await db('reservations as r')
            .join('users as u', 'r.user_id', 'u.id')
            .where('r.room_id', roomId)
            .select(
                'r.id',
                'r.room_id',
                'r.title',
                'r.start_time',
                'r.end_time',
                'r.status',
                'r.created_at',
                'r.updated_at',
                'u.id as user_id',
                'u.email as user_email'
            )
            .orderBy('r.start_time', 'asc');

        return rows.map(mapReservation);
    }

    // Przedziały półotwarte: start < end istniejącej rezerwacji
    // oraz koniec istniejącej rezerwacji > start nowej.
    async findConflicting(roomId, startTime, endTime, excludeId = null) {
        const query = db('reservations')
            .where('room_id', roomId)
            .whereNot('status', 'CANCELLED')
            .andWhere('start_time', '<', endTime)
            .andWhere('end_time', '>', startTime);

        if (excludeId !== null && excludeId !== undefined) {
            query.andWhere('id', '!=', excludeId);
        }

        const row = await query.first();
        return mapReservation(row);
    }

    async create(reservationData) {
        const [row] = await db('reservations')
            .insert({
                room_id: reservationData.roomId ?? reservationData.room_id,
                user_id: reservationData.userId,
                title: reservationData.title,
                start_time: reservationData.startTime ?? reservationData.start_time,
                end_time: reservationData.endTime ?? reservationData.end_time,
                status: reservationData.status ?? 'CONFIRMED'
            })
            .returning('id');

        return this.findById(row.id);
    }

    async updateStatus(id, status) {
        await db('reservations')
            .where({ id })
            .update({
                status,
                updated_at: db.fn.now()
            });

        return this.findById(id);
    }

    async findPage(filters) {
        const {
            roomId,
            buildingId,
            status,
            from,
            to,
            page = 1,
            limit = 20,
            sort = 'startTime'
        } = filters;

        const sortColumns = {
            startTime: 'r.start_time',
            createdAt: 'r.created_at'
        };

        const descending = sort.startsWith('-');
        const sortName = descending ? sort.slice(1) : sort;

        // W aktualnym schemacie nie ma kolumny participants.
        if (!sortColumns[sortName]) {
            throw new ValidationError(
                'Sortowanie po participants wymaga zdefiniowania danych uczestników'
            );
        }

        const applyFilters = (query) => {
            if (roomId !== undefined) {
                query.where('r.room_id', roomId);
            }

            if (buildingId !== undefined) {
                query.where('rm.building_id', buildingId);
            }

            if (status !== undefined) {
                query.where('r.status', status);
            }

            // Rezerwacja musi kończyć się po początku zakresu.
            if (from) {
                query.where('r.end_time', '>', new Date(from));
            }

            // Rezerwacja musi zaczynać się przed końcem zakresu.
            if (to) {
                query.where('r.start_time', '<', new Date(to));
            }

            return query;
        };

        const countQuery = applyFilters(
            db('reservations as r')
                .join('rooms as rm', 'r.room_id', 'rm.id')
                .join('users as u', 'r.user_id', 'u.id')
        ).countDistinct({ total: 'r.id' }).first();

        const dataQuery = applyFilters(
            db('reservations as r')
                .join('rooms as rm', 'r.room_id', 'rm.id')
                .join('users as u', 'r.user_id', 'u.id')
        )
            .select(
                'r.id',
                'r.room_id',
                'r.title',
                'r.start_time',
                'r.end_time',
                'r.status',
                'r.created_at',
                'r.updated_at',
                'u.id as user_id',
                'u.email as user_email'
            )
            .orderBy(sortColumns[sortName], descending ? 'desc' : 'asc')
            .orderBy('r.id', 'asc')
            .limit(limit)
            .offset((page - 1) * limit);

        // Wyświetlamy zapytania SQL i przekazywane do nich parametry.
        console.log('\n--- SQL: COUNT ---');
        console.log(countQuery.toSQL());

        console.log('\n--- SQL: DATA ---');
        console.log(dataQuery.toSQL());

        // Wykonujemy oba zapytania.
        const [countResult, rows] = await Promise.all([
            countQuery,
            dataQuery
        ]);

        const total = Number(countResult?.total ?? 0);

        return {
            data: rows.map(mapReservation),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }


    async createWithRoomLock(reservationData) {
        try {
            return await db.transaction(async (trx) => {
                const roomId =
                    reservationData.roomId ?? reservationData.room_id;

                // Blokujemy salę na czas wykonywania transakcji.
                const room = await trx('rooms')
                    .where({ id: roomId })
                    .forUpdate()
                    .first();

                if (!room) {
                    throw new NotFoundError('Room not found');
                }

                const startTime =
                    reservationData.startTime ?? reservationData.start_time;
                const endTime =
                    reservationData.endTime ?? reservationData.end_time;

                // Sprawdzamy, czy istnieje kolizja.
                const conflict = await trx('reservations')
                    .where('room_id', roomId)
                    .where('status', 'CONFIRMED')
                    .andWhere('start_time', '<', endTime)
                    .andWhere('end_time', '>', startTime)
                    .first();

                if (conflict) {
                    throw new ConflictError(
                        'Room is already booked for this time period',
                        'ROOM_ALREADY_BOOKED'
                    );
                }

                const [row] = await trx('reservations')
                    .insert({
                        room_id: roomId,
                        user_id: reservationData.userId,
                        title: reservationData.title,
                        start_time: startTime,
                        end_time: endTime,
                        status: 'CONFIRMED'
                    })
                    .returning('*');

                const user = await trx('users')
                    .select('id', 'email')
                    .where({ id: row.user_id })
                    .first();

                return mapReservation({
                    ...row,
                    user_id: user.id,
                    user_email: user.email
                });
            });
        } catch (error) {
            if (error.code === '23P01') {
                throw new ConflictError(
                    'Room is already booked for this time period',
                    'ROOM_ALREADY_BOOKED'
                );
            }

            throw error;
        }
    }

}

module.exports = new ReservationsRepositoryKnex();
