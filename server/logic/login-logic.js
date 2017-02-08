var userModelUtils = require('../model/user');
var User = userModelUtils().definition();
var MathUtils = require('../common/math-util');
var UserLogic = require('./user-logic');

module.exports = function () {
  return {
    login: function (loginData, callback) {
      User.findOne({ where: { userName: loginData.userName } })
        .then(user => {
          if (user != null && user.password === loginData.password) {
            user.authenticationToken = MathUtils().createGuid();
            UserLogic().updateUser(user, function (err, data) {
              if (err) {
                var errorMessage = "Authentication token could not be persisted.";
                console.log("login-logic: login - " + errorMessage);
                callback(true, errorMessage);
              }
              else {
                callback(null, { "wolfeAuthenticationToken": user.authenticationToken });
              }
            })
          }
        })
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("login-logic.logic() - " + errorMessage);
          callback(true, errorMessage);
        })
    }
  };
}