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

module.exports = {
  create,
};