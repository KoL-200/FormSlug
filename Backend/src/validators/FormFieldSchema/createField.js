const zod = require("zod");

const createFieldSchema = zod
    .object({
        label: zod.string().trim().min(1, "Label is required").max(40, "Label cannot exceed 40 characters"),
        type: zod.enum(["TEXT", "EMAIL", "TEXTAREA", "SELECT", "CHECKBOX"]),
        options: zod.array(
            zod.string().trim().min(1, "Options cannot be empty").max(100, "Options cannot exceed 100 characters"),
        ).min(1, "At least one option is required").max(30, "A maximum of 30 options is allowed").optional(),
        required: zod.boolean().optional(),
        placeholder: zod.string().trim().max(200, "Placeholder cannot exceed 200 characters").optional(),
    })
    .strict()
    .superRefine((field, ctx) => {
        if (field.type === "SELECT" && field.options === undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["options"],
                message: "Options are required for SELECT fields",
            });
        }

        if (field.type !== "SELECT" && field.options !== undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["options"],
                message: "Options are only allowed for SELECT fields",
            });
        }

        if (field.options !== undefined) {
            const options = new Set();
            field.options.forEach((option, index) => {
                if (options.has(option)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["options", index],
                        message: "Options must not contain duplicates",
                    });
                }
                options.add(option);
            });
        }
    });

module.exports = {
    createFieldSchema,
}