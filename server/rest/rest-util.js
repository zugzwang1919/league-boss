var DateUtils = require('../common/date-util');
var UserLogic = require('../logic/user-logic');
var RestResponse = require('./rest-response');
console.log("inside rest-util, User Logic ID = " + UserLogic.getIdentification());


exports.buildJSONfromMessage = function (message) {
  return { "message": message }
}

exports.ensureAuthenticated = function (req, res, next) {
  var token = req.header('Wolfe-Authentication-Token');
  if (token) {
    UserLogic.findUserByAuthenticationToken(token)
      // User found
      .then(user => {
        // If the session hasn't timed out...
        if (user.authenticationTokenExpiration > Date.now()) {
          // Bump the expiration date
          return UserLogic.updateUser(user.id, { authenticationTokenExpiration: DateUtils.createAuthenticationExpirationDate() });
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


exports.ensureSuperUser = function (req, res, next) {

  // Get the user associated with the token
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(foundUser => {
      // If this is a superuser, we're good to go (call next())
      if (foundUser.isSuperUser) {
        next();
      }
      // Otherwise, reject the request
      else {
        return Promise.reject({ "name": "NOT_SUPER_USER", "message": "The current user is not a super user." });
      }
    })
    .catch(error => {
      // If anything goes wrong, we're sending back a 403
      RestResponse.send403(res);
    })
}
