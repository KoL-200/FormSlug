const { prisma } = require('../../config/database.Config');

async function* streamSubmissions({ formId, includeDeleted = false }) {
    const where = {
        form_id: formId,
        ...(includeDeleted ? {} : { deleted_at: null }),
    };

    // cursor-based streaming — fetch in batches of 100
    // rather than loading all rows at once
    let cursor = undefined;
    const batchSize = 100;

    while (true) {
        const batch = await prisma.submission.findMany({
            where,
            take: batchSize,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { created_at: 'asc' },
        });

        if (batch.length === 0) break;

        for (const row of batch) {
            yield row;
        }

        if (batch.length < batchSize) break;
        cursor = batch[batch.length - 1].id;
    }
}

module.exports = { streamSubmissions };