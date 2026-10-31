const { z } = require('zod');

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

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email()
    .max(255)
    .transform((email) => email.toLowerCase()),

  password: z.string()
    .min(1)
    .max(72),
}).strict();

module.exports = {
  registerSchema,
  loginSchema,
};