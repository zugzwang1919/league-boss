
var MathUtils = require('../common/math-util');
var DateUtils = require('../common/date-util');
var UserLogic = require('./user-logic');
var LogicErrors = require('./logic-error');

module.exports = {

  login: function (loginData) {

    var guid = MathUtils.createGuid();
    // This is the only error message that we will provide in the 
    // event that we're being hacked.
    var errorMessage = "Login Credentials were not correct.";
    var foundUser;

    return UserLogic.findUserByUserName(loginData.userName)
      .then(user => {
        if (user != null && user.password === loginData.password) {
          user.authenticationToken = guid;
          user.authenticationTokenExpiration = DateUtils.createAuthenticationExpirationDate();
          foundUser = user;
          return UserLogic.updateUser(user);
        }
        else {
          return Promise.reject(LogicErrors.LOGIN_FAILED);
        }
      })

      .then(junk => { return Promise.resolve({ "user": foundUser, "wolfeAuthenticationToken": guid }); })

      .catch(err => {
        // If an error occurred, log it here.
        var loggedErrorMessage = LogicErrors.buildGenericMessage(err);
        console.log("login-logic.login() - " + loggedErrorMessage);
        // If any error occurred, just indicate that the login failed to the caller.
        return Promise.reject(LogicErrors.LOGIN_FAILED);
      })

  },

  logout: function (userName) {
    return UserLogic.findUserByUserName(userName)
      .then(user => {
        user.authenticationTokenExpiration = new Date();
        return UserLogic.updateUser(user);
      })
      .then(junk => {
        return Promise.resolve(null);
      })
      .catch(err => {
        // If an error occurred, get it into a proper format and log it
        var logicError = LogicErrors.firmUpError(err);
        console.log("login-logic.logout() - " + logicError.message);
        // If any error occurred, just indicate that the logout unexpectedly failed 
        return Promise.reject(logicError);
      })
  }

}