const express = require('express');
const swaggerUi = require('swagger-ui-express');

const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/requestLogger.Middleware');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes/index');
const activeFormBySlugRoutes = require('./routes/projectRoutes/activeFormBySlug.Routes');
const notFound = require('./middleware/notFound.Middleware');
const errorHandler = require('./middleware/errorHandler.Middleware');

const app = express();

app.use(requestLogger);

app.use(express.json());
app.set('trust proxy', 1);

app.use(cookieParser())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', activeFormBySlugRoutes);
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;