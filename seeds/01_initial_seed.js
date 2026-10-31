
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Czyszczenie tabel
  await knex('reservations').del();
  await knex('rooms').del();
  await knex('buildings').del();

  // Reset identyfikatorów
  await knex.raw('ALTER SEQUENCE reservations_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE rooms_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE buildings_id_seq RESTART WITH 1');

  const adminEmail = 'admin@example.com';

  let admin = await knex('users')
    .where({ email: adminEmail })
    .first();

  if (!admin) {
    const password = process.env.ADMIN_PASSWORD || 'Admin123456!';
    const passwordHash = await bcrypt.hash(password, 12);

    [admin] = await knex('users')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        role: 'ADMIN',
      })
      .returning('*');
  }

  const adminId = admin.id;

  // 1. Budynki
  const buildings = await knex('buildings').insert([
    { name: 'Budynek Główny', address: 'ul. Politechniki 1' },
    { name: 'Wydział Informatyki', address: 'ul. Akademicka 3' }
  ]).returning('*');

  const b1Id = buildings[0].id;
  const b2Id = buildings[1].id;

  // 2. Sale
  const rooms = await knex('rooms').insert([
    { building_id: b1Id, name: '101', capacity: 30 },
    { building_id: b1Id, name: '102', capacity: 50 },
    { building_id: b1Id, name: 'Audytorium', capacity: 200 },
    { building_id: b2Id, name: 'Laboratorium A', capacity: 20 },
    { building_id: b2Id, name: '204', capacity: 40 }
  ]).returning('*');

  const roomIds = rooms.map(room => room.id);

  // 3. Przygotowanie 20 rezerwacji
  const now = new Date();
  const reservations = [];

  for (let i = 0; i < 20; i++) {
    const startTime = new Date(
      now.getTime() + (i - 2) * 2 * 60 * 60 * 1000
    );

    const endTime = new Date(
      startTime.getTime() + 60 * 60 * 1000
    );

    let status = 'CONFIRMED';

    if (i === 0) {
      status = 'CONFIRMED';
    } else if (i === 1) {
      status = 'CANCELLED';
    } else if (i === 2) {
      status = 'PENDING';
    }

    reservations.push({
      room_id: roomIds[i % roomIds.length],
      user_id: adminId,
      title: `Rezerwacja testowa ${i + 1}`,
      start_time: startTime,
      end_time: endTime,
      status
    });
  }

  await knex('reservations').insert(reservations);
};
