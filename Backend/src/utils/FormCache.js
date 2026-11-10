const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const FORM_CACHE_TTL = 60;

async function getCachedForm(slug) {
    try {
        const cached = await redis.get(`form:${slug}`);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

async function getCachedPublicForm(slug) {
    try {
        const cached = await redis.get(`public-form:${slug}`);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

async function setCachedForm(slug, form) {
    try {
        await redis.set(`form:${slug}`, JSON.stringify(form), { ex: FORM_CACHE_TTL });
    } catch {
    }
}

async function setCachedPublicForm(slug, payload) {
    try {
        await redis.set(`public-form:${slug}`, JSON.stringify(payload), { ex: FORM_CACHE_TTL });
    } catch {
    }
}

async function invalidateFormCache(slug) {
    if (process.env.NODE_ENV === 'test') return;

    try {
        await redis.del(`form:${slug}`, `public-form:${slug}`);
    } catch {
    }
}

async function invalidatePublicFormCache(slug) {
    if (process.env.NODE_ENV === 'test') return;

    try {
        await redis.del(`public-form:${slug}`);
    } catch {
    }
}

module.exports = {
    getCachedForm,
    setCachedForm,
    invalidateFormCache,
    getCachedPublicForm,
    setCachedPublicForm,
    invalidatePublicFormCache,
};