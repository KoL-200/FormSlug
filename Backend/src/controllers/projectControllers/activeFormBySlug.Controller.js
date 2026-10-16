const { activeFormBySlug } = require('../../services/projectServices/activeFormSlug.Services');
const { validateSubmissionEnvelope } = require('../../utils/validateSubmissionEnvelope');
const { sendSubmissionNotification } = require('../../services/NotificationServices/notification.Services')
const { processWebhookDeliveries } = require('../../services/webhookServices/webhookDelivery.Services')
const { perFormRateLimit, perIpRateLimit } = require('../../lib/rateLimiter');
const { writeAuditLog } = require('../../utils/auditLog');
const logger = require('../../config/logger');

const { prisma } = require('../../config/database.Config');

const HONEYPOT_FIELD = '_gotcha';

const activeFormBySlugController = async (req, res) => {
    const { slug } = req.params;
    const form = await activeFormBySlug(slug);
    req.form = form;

    if (!form) {
        return res.status(404).json({ error: 'Form not found' });
    }

    if (form.deleted_at || !form.is_active) {
        return res.status(403).json({ error: 'Form is inactive' });
    }

    const authHeader = req.headers.authorization;
    if (authHeader) {
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ error: 'Invalid authorization format' });
        }
        const providedKey = authHeader.split(' ')[1];
        if (providedKey !== form.api_key) {
            return res.status(403).json({ error: 'Invalid API key' });
        }
    }

    const ipKey = req.ip;
    const formKey = form.id;

    const [ipResult, formResult] = process.env.NODE_ENV === 'test'
        ? [{ success: true }, { success: true }]
        : await Promise.all([
            perIpRateLimit.limit(ipKey),
            perFormRateLimit.limit(formKey),
        ]);

    if (!ipResult.success || !formResult.success) {
        await writeAuditLog({
            userId: null,
            action: 'rate_limit.triggered',
            metadata: {
                formId: form.id,
                ipAddress: req.ip,
                limitType: !ipResult.success ? 'ip' : 'form',
            },
            ipAddress: req.ip,
        });
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    if (req.body[HONEYPOT_FIELD]) {
        return res.status(200).json({ success: true });
    }

    req.body = validateSubmissionEnvelope(req.body);

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

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
        (req.log || logger).error({ err, requestId: req.requestId }, 'Webhook delivery batch failed unexpectedly');
    });

    await sendSubmissionNotification({ submission, form });
    res.status(200).json({ success: true });
}

module.exports = {
    activeFormBySlugController
}