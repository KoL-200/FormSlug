const { prisma } = require('../../config/database.Config');
const signPayload = require('../../utils/SignPayload');

const WEBHOOK_RETRY_INTERVAL_MS = 30_000;
const WEBHOOK_RETRY_STALE_AFTER_MS = 2 * 60 * 1000;

async function attemptDelivery(delivery, webhook) {
    const payloadString = JSON.stringify(delivery.payload);
    const signature = signPayload(payloadString, webhook.secret);

    try {
        const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Event-Id': delivery.id,
            },
            body: payloadString,
        });

        await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
                status: response.ok ? 'SENT' : 'FAILED',
                response_status_code: response.status,
                delivered_at: response.ok ? new Date() : null,
                attempts: { increment: 1 },
            },
        });
    } catch (err) {
        await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
                status: 'FAILED',
                attempts: { increment: 1 },
            },
        });
    }
}

async function claimDelivery(deliveryId, { staleCutoff } = {}) {
    const where = staleCutoff
        ? {
            id: deliveryId,
            OR: [
                { status: 'PENDING' },
                { status: 'SENDING', updated_at: { lt: staleCutoff } },
            ],
        }
        : { id: deliveryId, status: 'PENDING' };

    const result = await prisma.webhookDelivery.updateMany({
        where,
        data: { status: 'SENDING' },
    });

    return result.count === 1;
}

async function processWebhookDeliveries(deliveries, { staleCutoff } = {}) {
    await Promise.all(
        deliveries.map(async (delivery) => {
            const claimed = await claimDelivery(delivery.id, { staleCutoff });
            if (!claimed) return;

            const webhook = await prisma.webhookEndpoint.findUnique({
                where: { id: delivery.webhook_endpoint_id },
            });
            if (!webhook) return;

            await attemptDelivery(delivery, webhook);
        })
    );
}

async function findStuckWebhookDeliveries({ olderThanMs = WEBHOOK_RETRY_STALE_AFTER_MS, limit = 100 } = {}) {
    const cutoff = new Date(Date.now() - olderThanMs);

    return prisma.webhookDelivery.findMany({
        where: {
            OR: [
                { status: 'PENDING', created_at: { lt: cutoff } },
                { status: 'SENDING', updated_at: { lt: cutoff } },
            ],
        },
        orderBy: { created_at: 'asc' },
        take: limit,
    });
}

async function retryStuckWebhookDeliveries({ olderThanMs = WEBHOOK_RETRY_STALE_AFTER_MS, limit = 100 } = {}) {
    const stuckDeliveries = await findStuckWebhookDeliveries({ olderThanMs, limit });
    if (!stuckDeliveries.length) return 0;

    const staleCutoff = new Date(Date.now() - olderThanMs);
    await processWebhookDeliveries(stuckDeliveries, { staleCutoff });
    return stuckDeliveries.length;
}

function startWebhookRetrySweep({ intervalMs = WEBHOOK_RETRY_INTERVAL_MS, olderThanMs = WEBHOOK_RETRY_STALE_AFTER_MS, limit = 100 } = {}) {
    if (globalThis.__webhookRetrySweepTimer) {
        return globalThis.__webhookRetrySweepTimer;
    }

    const timer = setInterval(() => {
        retryStuckWebhookDeliveries({ olderThanMs, limit }).catch((err) => {
            console.error('Webhook retry sweep failed:', err);
        });
    }, intervalMs);

    globalThis.__webhookRetrySweepTimer = timer;
    return timer;
}

module.exports = {
    processWebhookDeliveries,
    findStuckWebhookDeliveries,
    retryStuckWebhookDeliveries,
    startWebhookRetrySweep,
};