const { z } = require('zod');

const updateFieldSchema = z.object({
    label: z.string().trim().min(1, 'Label is required').max(40, 'Label cannot exceed 40 characters').optional(),
    placeholder: z.string().trim().max(200, 'Placeholder cannot exceed 200 characters').optional(),
    required: z.boolean().optional(),
    options: z.array(
        z.string().trim().min(1, 'Options cannot be empty').max(100, 'Options cannot exceed 100 characters'),
    ).min(1, 'At least one option is required').max(30, 'A maximum of 30 options is allowed').optional(),
}).strict().refine((field) => field.label !== undefined || field.placeholder !== undefined || field.required !== undefined || field.options !== undefined, {
    message: 'At least one field is required',
});

const reorderFieldsSchema = z.object({
    order: z.array(z.string().uuid('Field ids must be valid UUID strings')).min(1, 'Order must include at least one field id').max(40, 'You cannot reorder more than 40 fields'),
}).strict();

module.exports = {
    updateFieldSchema,
    reorderFieldsSchema,
};
