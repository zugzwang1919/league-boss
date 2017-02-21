var Sequelize = require("Sequelize");

module.exports = function () {
  var sequelize = require('./index.js');
  return sequelize.define('user', {
    userName: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    emailAddress: {
      type: Sequelize.STRING
    },
    authenticationToken: {
      type: Sequelize.STRING
    },
    authenticationTokenExpiration: {
      type: Sequelize.DATE
    }
  },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )
}