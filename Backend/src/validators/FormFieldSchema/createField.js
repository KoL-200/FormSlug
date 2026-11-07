const zod = require("zod");

const createFieldSchema = zod
    .object({
        label: zod.string().min(1, "Label is required").max(40, "Label cannot exceed 40 characters"),
        type: zod.enum(["TEXT", "EMAIL", "TEXTAREA", "SELECT", "CHECKBOX"]),
        options: zod.array(zod.string()).optional(),
    })
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
    });

module.exports = {
    createFieldSchema,
}