
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVVNFUiIsImlhdCI6MTc5MzU1NzIwOSwiZXhwIjoxNzkzNTU4MTA5LCJzdWIiOiIxOSJ9.Alny7eIRU6JofU-tri35_KqcqrDeM5sBOfpkFhr5SZQ';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJpYXQiOjE3OTM1NTY3MDcsImV4cCI6MTc5MzU1NzYwNywic3ViIjoiMTQifQ.wKcD8N_8cX-LHLSFXPtVqpLc8Z2LaCGeuMyoyd-uQ2M';

const RESERVATION_ID = 11;       // ID rezerwacji USER
const OTHER_RESERVATION_ID = 20; // ID rezerwacji innego USER

const results = [];

async function test(name, method, endpoint, token, body, expected) {
  try {
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const passed = expected.includes(response.status);

    const result = {
      name,
      status: response.status,
      expected: expected.join(' lub '),
      passed,
      details: typeof data === 'object'
        ? JSON.stringify(data)
        : data
    };

    results.push(result);

    console.log(
      `${passed ? 'PASS' : 'FAIL'} | ${name} | HTTP ${response.status} | oczekiwano: ${result.expected}`
    );

    return data;
  } catch (error) {
    results.push({
      name,
      status: 'ERROR',
      expected: expected.join(' lub '),
      passed: false,
      details: error.message
    });

    console.log(`ERROR | ${name} | ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n=== TESTY AUTORYZACJI API ===\n');

  const suffix = Date.now();

  // AUTORYZACJA

  await test('T01 - Buildings bez tokenu',
    'GET', '/api/buildings', null, null, [401]);

  await test('T02 - Rooms bez tokenu',
    'GET', '/api/rooms', null, null, [401]);

  await test('T03 - Me jako USER',
    'GET', '/api/auth/me', USER_TOKEN, null, [200]);

  await test('T04 - Me jako ADMIN',
    'GET', '/api/auth/me', ADMIN_TOKEN, null, [200]);

  // BUILDINGS

  await test('T05 - GET buildings USER',
    'GET', '/api/buildings', USER_TOKEN, null, [200]);

  await test('T06 - GET buildings ADMIN',
    'GET', '/api/buildings', ADMIN_TOKEN, null, [200]);

  await test('T07 - POST buildings USER',
    'POST', '/api/buildings', USER_TOKEN,
    { name: `Test USER ${suffix}`, address: 'Testowa 1, Kraków' }, [403]);

  await test('T08 - POST buildings ADMIN',
    'POST', '/api/buildings', ADMIN_TOKEN,
    { name: `Test ADMIN ${suffix}`, address: 'Testowa 2, Kraków' }, [201]);

  // ROOMS

  await test('T09 - GET rooms USER',
    'GET', '/api/rooms', USER_TOKEN, null, [200]);

  await test('T10 - GET rooms ADMIN',
    'GET', '/api/rooms', ADMIN_TOKEN, null, [200]);

  await test('T11 - POST rooms USER',
    'POST', '/api/rooms', USER_TOKEN,
    { buildingId: 1, name: `Sala USER ${suffix}`, capacity: 10 }, [403]);

  await test('T12 - POST rooms ADMIN',
    'POST', '/api/rooms', ADMIN_TOKEN,
    { buildingId: 1, name: `Sala ADMIN ${suffix}`, capacity: 10 }, [201]);

  // RESERVATIONS - LISTA I FILTROWANIE

  await test('T13 - GET reservations USER',
    'GET', '/api/reservations', USER_TOKEN, null, [200]);

  await test('T14 - GET reservations ADMIN',
    'GET', '/api/reservations', ADMIN_TOKEN, null, [200]);

  await test('T15 - USER filtruje po userId',
    'GET', '/api/reservations?userId=2', USER_TOKEN, null, [403]);

  await test('T16 - ADMIN filtruje po userId',
    'GET', '/api/reservations?userId=2', ADMIN_TOKEN, null, [200]);

  // REZERWACJE KONKRETNE

  if (RESERVATION_ID && OTHER_RESERVATION_ID) {
    await test('T17 - USER pobiera własną rezerwację',
      'GET', `/api/reservations/${RESERVATION_ID}`, USER_TOKEN, null, [200]);

    await test('T18 - USER pobiera cudzą rezerwację',
      'GET', `/api/reservations/${OTHER_RESERVATION_ID}`, USER_TOKEN, null, [404]);

    await test('T19 - ADMIN pobiera cudzą rezerwację',
      'GET', `/api/reservations/${OTHER_RESERVATION_ID}`, ADMIN_TOKEN, null, [200]);

    await test('T20 - USER anuluje własną rezerwację',
      'PATCH', `/api/reservations/${RESERVATION_ID}/cancel`, USER_TOKEN, null, [200]);

    await test('T21 - USER anuluje cudzą rezerwację',
      'PATCH', `/api/reservations/${OTHER_RESERVATION_ID}/cancel`, USER_TOKEN, null, [404]);

    await test('T22 - ADMIN anuluje cudzą rezerwację',
      'PATCH', `/api/reservations/${OTHER_RESERVATION_ID}/cancel`, ADMIN_TOKEN, null, [200]);
  } else {
    console.log('\nPominięto T17-T22: uzupełnij ID rezerwacji w konfiguracji skryptu.');
  }

  // RAPORT

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  const report = [
    'RAPORT TESTÓW AUTORYZACJI API',
    `Data: ${new Date().toLocaleString('pl-PL')}`,
    '',
    ...results.map(r =>
      `${r.passed ? 'PASS' : 'FAIL'} | ${r.name} | HTTP ${r.status} | Oczekiwano: ${r.expected}\n${r.details}`
    ),
    '',
    `WYKONANE: ${results.length}`,
    `ZALICZONE: ${passed}`,
    `NIEZALICZONE: ${failed}`
  ].join('\n\n');

  const outputPath = path.join(__dirname, '..', 'authorization-test-results.txt');
  fs.writeFileSync(outputPath, report, 'utf8');

  console.log('\n==============================');
  console.log(`Wykonane: ${results.length}`);
  console.log(`Zaliczone: ${passed}`);
  console.log(`Niezaliczone: ${failed}`);
  console.log(`Raport zapisany: ${outputPath}`);
}

runTests();
