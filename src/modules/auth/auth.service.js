const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { registerSchema, loginSchema } = require('./auth.schema');
const usersRepository = require('./users.repository.knex');
const { toUserResponse } = require('./users.mapper');

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function register(data) {
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    throw createError(
      'VALIDATION_ERROR',
      'Nieprawidłowe dane rejestracji'
    );
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
      throw createError('EMAIL_TAKEN', 'Email jest już zajęty');
    }

    throw error;
  }
}

async function login(data) {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    throw createError(
      'INVALID_CREDENTIALS',
      'Nieprawidłowy email lub hasło'
    );
  }

  const { email, password } = result.data;
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw createError(
      'INVALID_CREDENTIALS',
      'Nieprawidłowy email lub hasło'
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw createError(
      'INVALID_CREDENTIALS',
      'Nieprawidłowy email lub hasło'
    );
  }

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  if (!secret) {
    throw new Error('Brak konfiguracji JWT_SECRET');
  }

  const accessToken = jwt.sign(
    {
      role: user.role,
    },
    secret,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn,
    }
  );

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn,
  };
}

async function getMe(userId) {
  const user = await usersRepository.findById(userId);

  if (!user) {
    throw createError('USER_NOT_FOUND', 'Użytkownik nie istnieje');
  }

  return toUserResponse(user);
}

module.exports = {
  register,
  login,
  getMe,
};