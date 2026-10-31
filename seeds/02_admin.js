const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const email = 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123456!';
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