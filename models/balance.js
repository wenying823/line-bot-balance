const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Balance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'balance',
    timestamps: false,
  });
};
