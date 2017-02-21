var Sequelize = require("Sequelize");

module.exports = function () {
  var sequelize = require('./index.js');
  return sequelize.define('league', {
    leagueName: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING
    },
  },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )
}