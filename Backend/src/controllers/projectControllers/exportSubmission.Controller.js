const { stringify } = require('csv-stringify');
const { streamSubmissions } = require('../../services/projectServices/exportSubmission.Services');

const exportSubmissionsController = async (req, res) => {
    const formId = req.form.id;
    const includeDeleted = req.query.includeDeleted === 'true';

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
                data: JSON.stringify(row.data),
            });
        }
    } catch (err) {
        console.error('CSV export error:', err);
    } finally {
        csvStringifier.end();
    }
};

module.exports = { exportSubmissionsController };