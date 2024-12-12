require('dotenv').config();
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

/**
 * Establishing connection with postgreSQL
 */
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
