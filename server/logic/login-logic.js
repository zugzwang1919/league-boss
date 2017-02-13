var userModelUtils = require('../model/user');
var User = userModelUtils().definition();
var MathUtils = require('../common/math-util');
var UserLogic = require('./user-logic');

module.exports = function () {
  return {
    login: function (loginData) {

      var guid = MathUtils.createGuid();
      // This is the only error message that we will provide in the 
      // event that we're being hacked.
      var errorMessage = "Login Credentials were not correct.";

      return User.findOne({ where: { userName: loginData.userName } })
        .then(user => {
          if (user != null && user.password === loginData.password) {
            user.authenticationToken = guid;
            return UserLogic().updateUser(user);
          }
          else {
            // Log more data than we'll return to the user
            console.log("login-logic.login() - id / password mismatch.")
            return Promise.reject({
              "name" : "ID / PW mismatch",
              "message" : errorMessage
            })
          }
        })

        .then(junk => {
          var dummyVar = "dummy string";
          return Promise.resolve({ "wolfeAuthenticationToken": guid });
        })

        .catch(err => {
          var localErrorMessage = "An error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("login-logic.login() - " + localErrorMessage);
          return Promise.reject(errorMessage);
        })
    }
  };
}