const { activeFormBySlug } = require('../../services/projectServices/activeFormSlug.Services');
const {
    getPublicFormBySlug,
    getPublicFormFieldsBySlug,
} = require('../../services/projectServices/publicForm.Services');
const { validateSubmissionEnvelope } = require('../../utils/validateSubmissionEnvelope');
const { validateAgainstFields } = require('../../utils/validateAgainstFields');
const { sendSubmissionNotification } = require('../../services/NotificationServices/notification.Services')
const { processWebhookDeliveries } = require('../../services/webhookServices/webhookDelivery.Services')
const logger = require('../../config/logger');
const { perIpRateLimit } = require('../../lib/rateLimiter');

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

    if (process.env.NODE_ENV === 'development') {
        (req.log || logger).debug({ slug, payload: req.body }, 'Development submission payload');
    }

    if (req.body && req.body[HONEYPOT_FIELD]) {
        return res.status(200).json({ success: true });
    }

    const envelope = validateSubmissionEnvelope(req.body);
    const fields = await getPublicFormFieldsBySlug(slug);
    const validation = validateAgainstFields(fields, envelope);

    if (validation.errors) {
        return res.status(422).json({
            error: 'Submission validation failed',
            details: validation.errors,
        });
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    const { submission, deliveries } = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create(
            {
                data: {
                    form_id: form.id,
                    data: validation.data,
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

const publicFormBySlugController = async (req, res) => {
    const payload = await getPublicFormBySlug(req.params.slug);
    return res.status(200).json(payload);
};

const publicFormRateLimit = async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const ipKey = req.ip;

    try {
        const ipResult = await perIpRateLimit.limit(ipKey);
        if (!ipResult.success) {
            return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }
    } catch (err) {
        console.error('Public form rate limiter error — allowing request through:', err.message);
    }

    next();
};

module.exports = {
    activeFormBySlugController,
    publicFormBySlugController,
    publicFormRateLimit,
}