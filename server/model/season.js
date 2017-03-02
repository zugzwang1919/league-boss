var Sequelize = require("Sequelize");

module.exports = function () {
  var sequelize = require('./index.js');
  return sequelize.define('season', {
    seasonName: {
      type: Sequelize.STRING,
    },
    beginDate: {
      type: Sequelize.DATEONLY,
    },
    endDate: {
      type: Sequelize.DATEONLY,
    },
  },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )
}