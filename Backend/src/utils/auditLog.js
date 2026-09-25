const { prisma } = require('../config/database.Config');

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
        console.error('Audit log write failed:', { action, err: err.message });
    }
}

module.exports = { writeAuditLog };