const db = require('../../db');

async function create({ email, passwordHash, role }) {
  const [user] = await db('users')
    .insert({
      email,
      password_hash: passwordHash,
      role,
    })
    .returning(['id', 'email', 'role', 'created_at']);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function findByEmail(email) {
  return db('users')
    .where({ email })
    .first();
}

async function findById(id) {
  const user = await db('users')
    .select('id', 'email', 'role', 'created_at')
    .where({ id })
    .first();

  return user || null;
}

module.exports = {
  create,
  findByEmail,
  findById,
};