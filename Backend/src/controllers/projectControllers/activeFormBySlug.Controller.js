const { activeFormBySlug } = require('../../services/projectServices/activeFormSlug.Services');
const { validateSubmissionEnvelope } = require('../../utils/validateSubmissionEnvelope');
const { sendSubmissionNotification } = require('../../services/NotificationServices/notification.Services')

const { prisma } = require('../../config/database.Config');

const HONEYPOT_FIELD = '_gotcha';

const activeFormBySlugController = async (req, res) => {
    const { slug } = req.params;
    const form = await activeFormBySlug(slug);

    if (req.body[HONEYPOT_FIELD]) {
        return res.status(200).json({ success: true });
    }

    req.body = validateSubmissionEnvelope(req.body);

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const submission = await prisma.submission.create(
        {
            data: {
                form_id: form.id,
                data: req.body,
                ip_address: ipAddress,
                user_agent: userAgent,
            }
        }
    )

    await sendSubmissionNotification({ submission, form });
    res.status(200).json({ success: true });
}

module.exports = {
    activeFormBySlugController
}