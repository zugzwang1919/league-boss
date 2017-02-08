var userModelUtils = require('../model/user');
var User = userModelUtils().definition();
var MathUtils = require('../common/math-util');

module.exports = function () {
  return {
    login: function (loginData, callback) {
      User.findOne({ where: { userName: loginData.userName } })
        .then(user => {
          if (user != null && user.password === loginData.password) {
            callback(null, { 'wolfeAuthenticationId' : MathUtils().createGuid() });
            return;
          }
          else {
            callback(true, "Invalid credentials.")
          }  
        })
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("login-logic.logic() - " + errorMessage);
          callback(true, errorMessage);
        })
    },
  };
}