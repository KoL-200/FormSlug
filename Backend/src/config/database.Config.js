const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const env = require('./env.Config');
const logger = require('./logger');

const databaseHost = new URL(env.DATABASE_URL).hostname;
const isLocalDatabase = ['localhost', '127.0.0.1', '[::1]'].includes(databaseHost);
const adapterOptions = { connectionString: env.DATABASE_URL };
if (isLocalDatabase) adapterOptions.ssl = false;
const adapter = new PrismaPg(adapterOptions);

const prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDatabase() {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
}

module.exports = { prisma, connectDatabase };