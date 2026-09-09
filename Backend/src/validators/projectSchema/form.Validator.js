const { z } = require('zod')

const createFormSchema = z.object(
    {
        name: z.string().min(1, 'Name is required'),
        notification_email: z.string().email({ pattern: z.regexes.rfc5322Email, message: 'Enter a valid email address' }).optional(),
    }
)

const updateFormSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    notification_email: z.string().email('Enter a valid email address').optional(),
    is_active: z.boolean().optional(),
})

module.exports = {
    createFormSchema,
    updateFormSchema,
}