const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email('Enter a valid email address').toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
    email: z.string().email('Enter a valid email address').toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Enter a valid password'),
});

const updateSchema = z.object(
    {
        name: z.string().min(1, 'Name is required').optional()
    }
)

const updatePasswordSchema = z.object(
    {
        currentPassword: z
            .string({ error: 'Current password is required' })
            .min(8, 'Enter a valid password'),
        newPassword: z
            .string({ error: 'New password is required' })
            .min(8, 'Enter a valid password'),
    }
)

module.exports = {
    registerSchema,
    loginSchema,
    updateSchema,
    updatePasswordSchema
};