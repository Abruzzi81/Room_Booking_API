const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Czyszczenie tabel
  await knex('reservations').del();
  await knex('rooms').del();
  await knex('buildings').del();

  await knex.raw("SELECT setval('buildings_id_seq', 1, false)");
  await knex.raw("SELECT setval('rooms_id_seq', 1, false)");
  await knex.raw("SELECT setval('reservations_id_seq', 1, false)");

  // Pobranie lub utworzenie użytkowników
  async function getOrCreateUser(email, role, password) {
    let user = await knex('users').where({ email }).first();

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 12);

      [user] = await knex('users')
        .insert({
          email,
          password_hash: passwordHash,
          role,
        })
        .returning('*');
    }

    return user;
  }

  const admin = await getOrCreateUser(
    'admin@example.com',
    'ADMIN',
    process.env.ADMIN_PASSWORD || 'Admin123456!'
  );

  const user1 = await getOrCreateUser(
    'user1@example.com',
    'USER',
    'User123456!'
  );

  const user2 = await getOrCreateUser(
    'user2@example.com',
    'USER',
    'User123456!'
  );

  // Budynki
  const buildings = await knex('buildings')
    .insert([
      { name: 'Budynek Główny', address: 'ul. Politechniki 1' },
      { name: 'Wydział Informatyki', address: 'ul. Akademicka 3' }
    ])
    .returning('*');

  const b1Id = buildings[0].id;
  const b2Id = buildings[1].id;

  // Sale
  const rooms = await knex('rooms')
    .insert([
      { building_id: b1Id, name: '101', capacity: 30 },
      { building_id: b1Id, name: '102', capacity: 50 },
      { building_id: b1Id, name: 'Audytorium', capacity: 200 },
      { building_id: b2Id, name: 'Laboratorium A', capacity: 20 },
      { building_id: b2Id, name: '204', capacity: 40 }
    ])
    .returning('*');

  const roomIds = rooms.map(room => room.id);

  // Rezerwacje
  const now = new Date();
  const reservations = [];

  const users = [
    { id: admin.id, count: 10, label: 'ADMIN' },
    { id: user1.id, count: 5, label: 'USER 1' },
    { id: user2.id, count: 5, label: 'USER 2' }
  ];

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];

    for (let i = 0; i < user.count; i++) {
      // Każda rezerwacja otrzymuje unikalny przedział czasu.
      const reservationIndex =
        users.slice(0, userIndex).reduce((sum, u) => sum + u.count, 0) + i;

      const startTime = new Date(
        now.getTime() + (reservationIndex + 1) * 2 * 60 * 60 * 1000
      );

      const endTime = new Date(
        startTime.getTime() + 60 * 60 * 1000
      );

      let status = 'CONFIRMED';

      if (i === 1) status = 'CANCELLED';
      if (i === 2) status = 'PENDING';

      reservations.push({
        room_id: roomIds[reservationIndex % roomIds.length],
        user_id: user.id,
        title: `Rezerwacja ${user.label} ${i + 1}`,
        start_time: startTime,
        end_time: endTime,
        status
      });
    }
  }

  await knex('reservations').insert(reservations);
};