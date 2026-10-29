/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // 1. Tabela BUDYNKI (buildings)
    await knex.schema.createTable('buildings', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique(); // UNIQUE dla nazwy budynku
        table.string('address').notNullable();
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    });

    // 2. Tabela SALE (rooms)
    await knex.schema.createTable('rooms', function (table) {
        table.increments('id').primary();
        table.integer('building_id').unsigned().notNullable()
            .references('id').inTable('buildings')
            .onDelete('CASCADE'); // Usunięcie budynku usuwa jego sale

        table.string('name').notNullable();
        table.integer('capacity').notNullable();
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

        // Unikalna para: budynek + nazwa sali
        table.unique(['building_id', 'name']);

        table.check('capacity > 0', [], 'rooms_capacity_positive');
    });

    // 3. Tabela REZERWACJE (reservations)
    await knex.schema.createTable('reservations', function (table) {
        table.increments('id').primary();
        table.integer('room_id').unsigned().notNullable()
            .references('id').inTable('rooms')
            .onDelete('RESTRICT');

        table.string('title').notNullable();
        table.timestamp('start_time', { useTz: true }).notNullable();
        table.timestamp('end_time', { useTz: true }).notNullable();
        table.string('status').notNullable().defaultTo('CONFIRMED');
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

        table.check('end_time > start_time', [], 'reservations_time_order');
        table.check("status IN ('PENDING', 'CONFIRMED', 'CANCELLED')", [], 'reservations_status_check');

        table.index(['room_id', 'start_time', 'end_time'], 'idx_reservations_room_time');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('reservations');
    await knex.schema.dropTableIfExists('rooms');
    await knex.schema.dropTableIfExists('buildings');
};