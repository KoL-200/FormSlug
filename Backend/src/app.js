const express = require('express');

const cookieParser = require('cookie-parser')
const routes = require('./routes/index');
const notFound = require('./middleware/notFound.Middleware');
const errorHandler = require('./middleware/errorHandler.Middleware');

const app = express();

app.use(express.json());
app.use(cookieParser())

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;