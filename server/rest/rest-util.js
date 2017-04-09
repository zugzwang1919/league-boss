var DateUtils = require('../common/date-util');
var UserLogic = require('../logic/user-logic');
var RestResponse = require('./rest-response');

module.exports = {
  buildJSONfromMessage: function (message) {
    return { "message": message }
  },
  ensureAuthenticated: function (req, res, next) {
    var token = req.header('Wolfe-Authentication-Token');
    if (token) {
      UserLogic.findUserByAuthenticationToken(token)
        // User found
        .then(user => {
          // If the session hasn't timed out...
          if (user.authenticationTokenExpiration > Date.now()) {
            // Bump the expiration date
            return UserLogic.updateUser(user.id, {authenticationTokenExpiration: DateUtils.createAuthenticationExpirationDate()});
          }
          // Session timed out
          else {
            return Promise.reject({ "name": "SESSION_TIMEOUT", "message": "Session timed out." });
          }
        })
        // Update went OK
        .then(user => {
          res.append('Wolfe-Authentication-Token', token);
          next();
        })
        // Something went wrong
        .catch(err => {
          console.log("err.name = " + err.name);
          console.log("err.message = " + err.message);
          RestResponse.send401(res);
        });
    }
    else {
      RestResponse.send401(res);
    }
  }
}