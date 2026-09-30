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

async function setCachedForm(slug, form) {
    try {
        await redis.set(`form:${slug}`, JSON.stringify(form), { ex: FORM_CACHE_TTL });
    } catch {
    }
}

async function invalidateFormCache(slug) {
    try {
        await redis.del(`form:${slug}`);
    } catch {
    }
}

module.exports = { getCachedForm, setCachedForm, invalidateFormCache };