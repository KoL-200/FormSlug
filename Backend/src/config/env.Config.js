require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgresql://postgres:algo1502@localhost:5432/Formslug_db?schema=public'),
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required').default('1b22f68d95f6b993b1fb8ed48219242a600742e473f1674e52d96ccebef5b99c'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required').default('99a5276c2563e34d28420fe922ce118cfcaaf8430cf529b7f04d77a4525ed5d8'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid Environment Variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
}

module.exports = parsed.data;