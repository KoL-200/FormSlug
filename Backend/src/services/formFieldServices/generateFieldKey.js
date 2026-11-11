const { prisma } = require('../../config/database.Config');
const { BadRequestError } = require('../../utils/AppError');
const { uniqueFieldKey } = require('../../utils/fieldKey');

const generateFieldKey = async (formId, label) => {
    if (typeof formId !== 'string' || formId.length === 0) {
        throw new BadRequestError('A form ID is required');
    }

    if (typeof label !== 'string') {
        throw new BadRequestError('A field label is required');
    }

    const existingKeys = await prisma.formField.findMany({
        where: { form_id: formId },
        select: { key: true },
    });
    const keys = new Set(existingKeys.map(({ key: existingKey }) => existingKey));
    return uniqueFieldKey(label, keys);
};

module.exports = { generateFieldKey };