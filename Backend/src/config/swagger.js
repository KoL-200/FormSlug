const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FormSlug API',
            version: '1.0.0',
            description: 'Multi-tenant public form submission backend',
        },
        servers: [{ url: '/api/v1', description: 'API v1' }],
        tags: [
            { name: 'Auth', description: 'Account registration and authentication' },
            { name: 'Health', description: 'API and dependency health' },
            { name: 'Public submissions', description: 'Third-party public form submission' },
            { name: 'Projects', description: 'Dashboard project management' },
            { name: 'Forms', description: 'Dashboard form management' },
            { name: 'Submissions', description: 'Dashboard submission management' },
            { name: 'Webhooks', description: 'Project webhook management and testing' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Access token returned by POST /auth/login or POST /auth/refresh.',
                },
                refreshTokenCookie: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken',
                    description: 'HttpOnly refresh-token cookie issued by POST /auth/login.',
                },
                formApiKey: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'Form API key',
                    description: 'Optional form API key, sent as Authorization: Bearer <form_api_key>. Separate from dashboard access tokens.',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    required: ['error'],
                    properties: { error: { type: 'string' } },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        deleted_at: { type: 'string', format: 'date-time', nullable: true },
                        scheduled_purge_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password', minLength: 8 },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string' },
                                user: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
                AccessTokenResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { type: 'object', properties: { accessToken: { type: 'string' } } },
                    },
                },
                MessageResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        message: { type: 'string' },
                    },
                },
                UpdateProfileRequest: {
                    type: 'object',
                    properties: { name: { type: 'string', minLength: 1 } },
                },
                UpdatePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string', format: 'password', minLength: 8 },
                        newPassword: { type: 'string', format: 'password', minLength: 8 },
                    },
                },
                SubmissionAccepted: {
                    type: 'object',
                    required: ['success'],
                    properties: { success: { type: 'boolean', enum: [true] } },
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        user_id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        deleted_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                ProjectRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: { name: { type: 'string', minLength: 1 } },
                },
                UpdateProjectRequest: {
                    type: 'object',
                    properties: { name: { type: 'string', minLength: 1 } },
                },
                Form: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        project_id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        api_key: {
                            type: 'string',
                            description: 'Full key on create, rotate, and delete responses; masked on form reads.',
                        },
                        config: { type: 'object', additionalProperties: true },
                        notification_email: { type: 'string', format: 'email', nullable: true },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        deleted_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                FormRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        notification_email: { type: 'string', format: 'email' },
                    },
                },
                UpdateFormRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        notification_email: { type: 'string', format: 'email' },
                        is_active: { type: 'boolean' },
                    },
                },
                RotatedApiKeyResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                api_key: { type: 'string' },
                                updated_at: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
                Submission: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        form_id: { type: 'string', format: 'uuid' },
                        data: { type: 'object', additionalProperties: true },
                        ip_address: { type: 'string' },
                        user_agent: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        deleted_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                SuccessUser: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { $ref: '#/components/schemas/User' },
                    },
                },
                SuccessProject: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { $ref: '#/components/schemas/Project' },
                    },
                },
                SuccessProjectList: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                    },
                },
                SuccessForm: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { $ref: '#/components/schemas/Form' },
                    },
                },
                SuccessFormList: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { type: 'array', items: { $ref: '#/components/schemas/Form' } },
                    },
                },
                SuccessSubmission: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { $ref: '#/components/schemas/Submission' },
                    },
                },
                SuccessSubmissionList: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { type: 'array', items: { $ref: '#/components/schemas/Submission' } },
                        meta: {
                            type: 'object',
                            properties: {
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' },
                                page: { type: 'integer' },
                            },
                        },
                    },
                },
                Webhook: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        project_id: { type: 'string', format: 'uuid' },
                        url: { type: 'string', format: 'uri' },
                        secret: { type: 'string', description: 'Signing secret used to verify webhook signatures.' },
                        events: { type: 'array', items: { type: 'string' } },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                WebhookRequest: {
                    type: 'object',
                    required: ['url'],
                    properties: { url: { type: 'string', format: 'uri', description: 'Must use HTTPS.' } },
                },
                UpdateWebhookRequest: {
                    type: 'object',
                    additionalProperties: false,
                    anyOf: [{ required: ['url'] }, { required: ['is_active'] }],
                    properties: {
                        url: { type: 'string', format: 'uri', description: 'Must use HTTPS.' },
                        is_active: { type: 'boolean' },
                    },
                },
                SuccessWebhook: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: { $ref: '#/components/schemas/Webhook' },
                    },
                },
                SuccessWebhookTest: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        data: {
                            type: 'object',
                            properties: {
                                delivered: { type: 'boolean' },
                                statusCode: { type: 'integer', nullable: true },
                                error: { type: 'string', nullable: true },
                            },
                        },
                    },
                },
            },
            responses: {
                BadRequest: {
                    description: 'The request body or parameters are invalid.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                ValidationFailed: {
                    description: 'Request validation failed.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
                },
                Unauthorized: {
                    description: 'Authentication is missing, expired, or invalid.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                Forbidden: {
                    description: 'The caller is not allowed to access this resource or supplied an invalid form key.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                NotFound: {
                    description: 'The requested resource was not found.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                Conflict: {
                    description: 'A resource conflicts with an existing record.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                RateLimited: {
                    description: 'The submission rate limit has been exceeded.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                InternalError: {
                    description: 'An unexpected server error occurred.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/**/*.js'],
};

module.exports = swaggerJsdoc(options);