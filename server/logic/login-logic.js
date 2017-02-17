var UserModelUtils = require('../model/user');
var User = UserModelUtils.definition();
var MathUtils = require('../common/math-util');
var UserLogic = require('./user-logic');
var LogicErrors = require('./logic-error');

module.exports = {

  login: function (loginData) {

    var guid = MathUtils.createGuid();
    // This is the only error message that we will provide in the 
    // event that we're being hacked.
    var errorMessage = "Login Credentials were not correct.";

    return UserLogic.findUserByUserName( loginData.userName )
      .then(user => {
        if (user != null && user.password === loginData.password) {
          user.authenticationToken = guid;
          return UserLogic.updateUser(user);
        }
        else {
          return Promise.reject(LogicErrors.LOGIN_FAILED);
        }
      })

      .then(junk => { return Promise.resolve({ "wolfeAuthenticationToken": guid }); })

      .catch(err => {
        // If an error occurred, log it here.
        var loggedErrorMessage = LogicErrors.buildGenericMessage(err);
        console.log("login-logic.login() - " + loggedErrorMessage);
        // If any error occurred, just indicate that the login failed to the caller.
        return Promise.reject(LogicErrors.LOGIN_FAILED);
      })

  }
}