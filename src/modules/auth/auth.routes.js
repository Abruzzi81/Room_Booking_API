const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const router = express.Router();

const db = require('../../db');

const registerSchema = z.object({
  email: z.string()
    .trim()
    .email()
    .max(255)
    .transform((email) => email.toLowerCase()),

  password: z.string()
    .min(10)
    .max(72),
}).strict();

router.post('/register', async (req, res, next) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Nieprawidłowe dane rejestracji',
      errors: validation.error.flatten(),
    });
  }

  const { email, password } = validation.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'USER',
      })
      .returning(['id', 'email', 'role', 'created_at']);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    if (
      error.code === '23505' &&
      error.constraint === 'users_email_unique'
    ) {
      return res.status(409).json({
        code: 'EMAIL_TAKEN',
        message: 'Konto z tym adresem email już istnieje',
      });
    }

    return next(error);
  }
});

module.exports = router;