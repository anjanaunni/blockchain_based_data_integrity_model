const { Sequelize } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  dob: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  ppsn: {
    type: Sequelize.STRING(12),
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
