const { z } = require('zod')

const createWebhookSchema = z.object({
    url: z.string().url('Enter a valid URL').refine((url) => url.startsWith('https://'), {
        message: 'Webhook URL must use HTTPS',
    })
})

const updateWebhookSchema = z.object({
    url: z.string().url('Enter a valid URL').refine((url) => url.startsWith('https://'), {
        message: 'Webhook URL must use HTTPS',
    }).optional(),
    is_active: z.boolean().optional(),
}).strict().refine((webhook) => webhook.url !== undefined || webhook.is_active !== undefined, {
    message: 'At least one of url or is_active is required',
});

module.exports = {
    createWebhookSchema,
    updateWebhookSchema
}