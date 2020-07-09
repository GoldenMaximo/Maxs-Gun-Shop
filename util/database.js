const Sequelize = require('sequelize').Sequelize;
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, proces.env.DB_PASS, {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;