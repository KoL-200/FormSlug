const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const env = require('./env.Config');
const logger = require('./logger');

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDatabase() {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
}

module.exports = { prisma, connectDatabase };