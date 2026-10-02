function redactForm(form) {
    if (!form) return form;
    return {
        ...form,
        api_key: `****${form.api_key.slice(-4)}`,
    };
}

function redactForms(forms) {
    return forms.map(redactForm);
}

module.exports = { redactForm, redactForms };