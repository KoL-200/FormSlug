const { stringify } = require('csv-stringify');
const { streamSubmissions } = require('../../services/projectServices/exportSubmission.Services');
const { mapLegacyFormFields } = require('../../utils/legacyFormFields');
const logger = require('../../config/logger');

function normalizeLegacySubmissionData(data, fields) {
    const normalized = { ...data };

    for (const field of fields) {
        if (!Object.hasOwn(normalized, field.legacyKey)) continue;
        if (!Object.hasOwn(normalized, field.key)) {
            normalized[field.key] = normalized[field.legacyKey];
        }
        delete normalized[field.legacyKey];
    }

    return normalized;
}

const exportSubmissionsController = async (req, res) => {
    const formId = req.form.id;
    const includeDeleted = req.query.includeDeleted === 'true';
    const legacyFields = mapLegacyFormFields(req.form.config?.fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="submissions-${formId}.csv"`
    );

    const csvStringifier = stringify({
        header: true,
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'created_at', header: 'Submitted At' },
            { key: 'ip_address', header: 'IP Address' },
            { key: 'data', header: 'Data (JSON)' },
        ],
    });

    csvStringifier.pipe(res);

    try {
        for await (const row of streamSubmissions({ formId, includeDeleted })) {
            csvStringifier.write({
                id: row.id,
                created_at: row.created_at.toISOString(),
                ip_address: row.ip_address,
                data: JSON.stringify(normalizeLegacySubmissionData(row.data, legacyFields)),
            });
        }
    } catch (err) {
        (req.log || logger).error({ err, requestId: req.requestId }, 'CSV export error');
    } finally {
        csvStringifier.end();
    }
};

module.exports = { exportSubmissionsController };