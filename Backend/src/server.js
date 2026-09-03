require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database.Config');
const env = require('./config/env.Config');

const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();