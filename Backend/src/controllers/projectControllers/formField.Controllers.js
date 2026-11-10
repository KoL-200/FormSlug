const {
    createField,
    listFields,
    updateField,
    deleteField,
    reorderFields,
} = require('../../services/formFieldServices/formField.Services'); const { writeAuditLog } = require('../../utils/auditLog');
const { invalidatePublicFormCache } = require('../../utils/FormCache');
const createFieldController = async (req, res) => {
    const field = await createField({
        ...req.body,
        formId: req.form.id,
    });
    await invalidatePublicFormCache(req.form.slug);

    res.status(201).json({ success: true, data: field });
};

const listFieldsController = async (req, res) => {
    const fields = await listFields({
        formId: req.form.id,
        includeDeleted: req.query.includeDeleted === 'true',
    });

    res.status(200).json({ success: true, data: fields });
};

const updateFieldController = async (req, res) => {
    const field = await updateField({
        formId: req.form.id,
        fieldId: req.params.fieldId,
        ...req.body,
    });
    await invalidatePublicFormCache(req.form.slug);

    res.status(200).json({ success: true, data: field });
};

const deleteFieldController = async (req, res) => {
    await deleteField({
        formId: req.form.id,
        fieldId: req.params.fieldId,
    });
    await invalidatePublicFormCache(req.form.slug);

    await writeAuditLog({
        userId: req.user.id,
        action: 'form.field.deleted',
        metadata: {
            formId: req.form.id,
            projectId: req.params.projectId,
            fieldId: req.params.fieldId,
        },
        ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Field deleted successfully' });
};

const reorderFieldsController = async (req, res) => {
    const reorderedFields = await reorderFields({
        formId: req.form.id,
        order: req.body.order,
    });
    await invalidatePublicFormCache(req.form.slug);

    res.status(200).json({ success: true, data: reorderedFields });
};

module.exports = {
    createFieldController,
    listFieldsController,
    updateFieldController,
    deleteFieldController,
    reorderFieldsController,
};
