var Sequelize = require("Sequelize");

module.exports = {
  definition: function () {
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
  },
  
  prePopulate: function (User) {
    User.sync({ force: true })
    .then(function () {
      console.log("Request received to pre-populate Users")
      User.create({
        userName: 'RWW',
        password: 'RWW',
        emailAddress: 'russ.wolfe@gmail.com',

      })
      User.create({
        userName: 'TB',
        password: 'TB',
        emailAddress: 'tom.brady@gmail.com',

      })
    })
  }

}