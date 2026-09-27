const { rotateFormApiKey } = require('../../services/projectServices/rotationApiKey.Services');
const { writeAuditLog } = require('../../utils/auditLog');

const rotateApiKeyController = async (req, res) => {
    const { projectId, formId } = req.params;

    const updated = await rotateFormApiKey({ formId, projectId });

    await writeAuditLog({
        userId: req.user.id,
        action: 'form.api_key.rotated',
        metadata: { formId, projectId },
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: updated });
};

module.exports = { rotateApiKeyController };