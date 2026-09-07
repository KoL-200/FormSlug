const { z } = require('zod')

const createFormSchema = z.object(
    {
        name: z.string().min(1, 'Name is required'),
        notification_email: z.string().email({ pattern: z.regexes.rfc5322Email, message: 'Enter a valid email address' }).optional(),
    }
)

module.exports = {
    createFormSchema,
}