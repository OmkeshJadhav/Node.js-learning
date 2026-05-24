const mongoose = require('mongoose')
const logger = require('../utils/logger')

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info ("DB connected successfully!");
    } catch (error) {
        logger.error('Failed to connect to DB -> ', error);
        process.exit(1);
    }
};

module.exports = connectToDB;