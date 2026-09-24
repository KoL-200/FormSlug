const { activeFormBySlug } = require('../../services/projectServices/activeFormSlug.Services');
const { validateSubmissionEnvelope } = require('../../utils/validateSubmissionEnvelope');
const { sendSubmissionNotification } = require('../../services/NotificationServices/notification.Services')
const { processWebhookDeliveries } = require('../../services/webhookServices/webhookDelivery.Services')
const { perFormRateLimit, perIpRateLimit } = require('../../lib/rateLimiter');

const { prisma } = require('../../config/database.Config');

const HONEYPOT_FIELD = '_gotcha';

const activeFormBySlugController = async (req, res) => {
    const { slug } = req.params;
    const form = await activeFormBySlug(slug);

    const ipKey = req.ip;
    const formKey = form.id;

    const [ipResult, formResult] = await Promise.all([
        perIpRateLimit.limit(ipKey),
        perFormRateLimit.limit(formKey),
    ]);

    if (!ipResult.success || !formResult.success) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
        });
    }

    if (req.body[HONEYPOT_FIELD]) {
        return res.status(200).json({ success: true });
    }

    req.body = validateSubmissionEnvelope(req.body);

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const { submission, deliveries } = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create(
            {
                data: {
                    form_id: form.id,
                    data: req.body,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                }
            }
        )

        const activeWebhooks = await tx.webhookEndpoint.findMany(
            {
                where: {
                    project_id: form.project_id,
                    is_active: true
                }
            }
        )

        const deliveries = await Promise.all(
            activeWebhooks.map((webhook) =>
                tx.webhookDelivery.create(
                    {
                        data: {
                            webhook_endpoint_id: webhook.id,
                            event_type: 'submission.created',
                            payload: {
                                event: 'submission.created',
                                data: submission.data,
                                submitted_at: submission.created_at
                            },
                            status: 'PENDING',
                        }
                    }
                )
            )
        )
        return { submission, deliveries }
    })

    processWebhookDeliveries(deliveries).catch((err) => {
        console.error('Webhook delivery batch failed unexpectedly', err);
    });

    await sendSubmissionNotification({ submission, form });
    res.status(200).json({ success: true });
}

module.exports = {
    activeFormBySlugController
}