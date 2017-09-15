var Sequelize = require("Sequelize");

exports.definition = function () {
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
    isSuperUser: {
      type: Sequelize.BOOLEAN
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