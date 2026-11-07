const { createField } = require('../../services/formFieldServices/createField');

const createFieldController = async (req, res) => {
    const field = await createField({
        ...req.body,
        formId: req.form.id,
    });

    res.status(201).json({ success: true, data: field });
};

module.exports = { createFieldController };
