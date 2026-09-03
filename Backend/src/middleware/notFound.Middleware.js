function notFound(req, res) {
    res.status(400).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

module.exports = notFound