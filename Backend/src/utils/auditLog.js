const { prisma } = require('../config/database.Config');
const logger = require('../config/logger');

async function writeAuditLog({ userId = null, action, metadata = {}, ipAddress }) {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                action,
                metadata,
                ip_address: ipAddress || 'unknown',
            },
        });
    } catch (err) {
        logger.error({ action, err }, 'Audit log write failed');
    }
}

module.exports = { writeAuditLog };