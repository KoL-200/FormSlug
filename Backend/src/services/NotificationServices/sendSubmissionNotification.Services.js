const { prisma } = require('../../config/database.Config')

const log = await prisma.notificationLog.create(
    {
        data: {
            submission_id: submission.id,
            type: 'email',
            status: 'PENDING',
        },
    }
);