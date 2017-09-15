var Sequelize = require("Sequelize");

exports.definition = function () {
  var sequelize = require('./index.js');
  return sequelize.define('league', {
    leagueName: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING
    },
    seasonTypeIndex: {
      type: Sequelize.INTEGER
    },
    leagueTypeIndex: {
      type: Sequelize.INTEGER
    },
  },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )
}