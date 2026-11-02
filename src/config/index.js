
const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    DATABASE_URL: z
        .string()
        .min(1, 'DATABASE_URL jest wymagany')
        .url('DATABASE_URL musi być poprawnym URL-em')
        .refine(
            (value) =>
                ['postgres:', 'postgresql:'].includes(
                    new URL(value).protocol
                ),
            'DATABASE_URL musi wskazywać na PostgreSQL'
        ),

    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET musi mieć co najmniej 32 znaki'),

    JWT_EXPIRES_IN: z
        .string()
        .regex(
            /^[1-9]\d*[smhd]$/,
            'JWT_EXPIRES_IN musi mieć format np. 15m, 1h, 7d'
        )
        .default('15m'),

    ADMIN_PASSWORD: z.string()
        .min(12, 'ADMIN_PASSWORD musi mieć co najmniej 12 znaków')
        .optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('\nBŁĄD KONFIGURACJI APLIKACJI:\n');

    for (const issue of result.error.issues) {
        console.error(
            `- ${issue.path.join('.')}: ${issue.message}`
        );
    }

    console.error('\nPopraw plik .env.\n');
    process.exit(1);
}

module.exports = Object.freeze(result.data);
