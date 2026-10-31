const bcrypt = require('bcryptjs');
const { registerSchema } = require('./auth.schema');
const usersRepository = require('./users.repository.knex');
const { toUserResponse } = require('./user.mapper');

async function register(data) {
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    const error = new Error('Nieprawidłowe dane rejestracji');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const { email, password } = result.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await usersRepository.create({
      email,
      passwordHash,
      role: 'USER',
    });

    return toUserResponse(user);
  } catch (error) {
    if (
      error.code === '23505' &&
      error.constraint === 'users_email_unique'
    ) {
      const taken = new Error('Email jest już zajęty');
      taken.code = 'EMAIL_TAKEN';
      throw taken;
    }

    throw error;
  }
}

module.exports = {
  register,
};