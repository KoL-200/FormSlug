const { prisma } = require('../../config/database.Config');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function createNotificationLog({ submission, type = 'email', status = 'PENDING' }) {
    return prisma.notificationLog.create({
        data: {
            submission_id: submission.id,
            type,
            status,
        },
    });
}

const sendSubmissionNotification = async ({ submission, form }) => {
    const logEntry = await createNotificationLog({ submission });

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: form.notification_email,
            subject: `New submission on ${form.name}`,
            text: JSON.stringify(submission.data, null, 2),
        });

        if (error) {
            await prisma.notificationLog.update({
                where: { id: logEntry.id },
                data: { status: 'FAILED', attempts: { increment: 1 }, last_error: error.message },
            });
            return;
        }

        await prisma.notificationLog.update({
            where: { id: logEntry.id },
            data: { status: 'SENT', sent_at: new Date(), attempts: { increment: 1 } },
        });
    } catch (err) {
        await prisma.notificationLog.update({
            where: { id: logEntry.id },
            data: { status: 'FAILED', attempts: { increment: 1 }, last_error: err.message },
        });
    }
};

module.exports = {
    sendSubmissionNotification
}