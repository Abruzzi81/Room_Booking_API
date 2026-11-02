const bcrypt = require('bcryptjs');
const config = require('../src/config');

exports.seed = async function (knex) {
  const email = 'admin@example.com';
  if (!config.ADMIN_PASSWORD) {
    throw new Error('Brak ADMIN_PASSWORD w pliku .env');
  }

  const password = config.ADMIN_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  await knex('users')
    .insert({
      email,
      password_hash: passwordHash,
      role: 'ADMIN',
    })
    .onConflict('email')
    .merge({
      password_hash: passwordHash,
      role: 'ADMIN',
    });
};

/*  UZYTKOWNIK
{
  "email": "nowy.user@test.pl",
  "password": "Test12345!"
}
  */