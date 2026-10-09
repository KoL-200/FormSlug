const { z } = require('zod');
const logger = require('./logger');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
    UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    logger.error({
        issues: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    }, 'Invalid environment configuration');
    process.exit(1);
}

module.exports = result.data;