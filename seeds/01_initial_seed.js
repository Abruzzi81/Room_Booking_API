/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Czyszczenie tabel w odpowiedniej kolejności (z uwagi na klucze obce) oraz resetowanie auto-inkrementacji (RESTART IDENTITY)
  await knex('reservations').del();
  await knex('rooms').del();
  await knex('buildings').del();

  // Reset identyfikatorów (ID od 1)
  await knex.raw('ALTER SEQUENCE reservations_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE rooms_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE buildings_id_seq RESTART WITH 1');

  // 1. Wstawienie 2 budynków
  const buildings = await knex('buildings').insert([
    { name: 'Budynek Główny', address: 'ul. Politechniki 1' },
    { name: 'Wydział Informatyki', address: 'ul. Akademicka 3' }
  ]).returning('*');

  const b1Id = buildings[0].id;
  const b2Id = buildings[1].id;

  // 2. Wstawienie 5 sal (rozłożonych na 2 budynki)
  const rooms = await knex('rooms').insert([
    { building_id: b1Id, name: '101', capacity: 30 },
    { building_id: b1Id, name: '102', capacity: 50 },
    { building_id: b1Id, name: 'Audytorium', capacity: 200 },
    { building_id: b2Id, name: 'Laboratorium A', capacity: 20 },
    { building_id: b2Id, name: '204', capacity: 40 }
  ]).returning('*');

  const r1Id = rooms[0].id;
  const r2Id = rooms[1].id;
  const r3Id = rooms[3].id;

  // 3. Wstawienie 5 rezerwacji (zgodnie z wymogami: jedna CANCELLED, jedna już się rozpoczęła)
  const now = new Date();
  const pastTimeStart = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 godziny temu (już się rozpoczęła)
  const pastTimeEnd = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  
  const futureStart1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const futureEnd1 = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  await knex('reservations').insert([
    { 
      room_id: r1Id, 
      title: 'Wykład z Bazy Danych', 
      start_time: pastTimeStart, 
      end_time: pastTimeEnd, 
      status: 'CONFIRMED' 
    }, // Rezerwacja, która już się rozpoczęła / odbyła
    { 
      room_id: r1Id, 
      title: 'Spotkanie Koła Naukowego', 
      start_time: futureStart1, 
      end_time: futureEnd1, 
      status: 'CANCELLED' 
    }, // Rezerwacja CANCELLED
    { 
      room_id: r2Id, 
      title: 'Seminarium Dyplomowe', 
      start_time: futureStart1, 
      end_time: futureEnd1, 
      status: 'CONFIRMED' 
    },
    { 
      room_id: r3Id, 
      title: 'Warsztaty Programowania', 
      start_time: futureStart1, 
      end_time: futureEnd1, 
      status: 'PENDING' 
    },
    { 
      room_id: r2Id, 
      title: 'Konsultacje', 
      start_time: futureStart1, 
      end_time: futureEnd1, 
      status: 'CONFIRMED' 
    }
  ]);
};