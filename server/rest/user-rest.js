
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var LogicError = require('../logic/logic-error');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');
console.log("inside user-rest, User Logic ID = " + UserLogic.getIdentification());


router.get('/:userId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("user-rest getUser:  Looking for user with an id of " + req.params.userId);
  UserLogic.findUserById(req.params.userId)
    .then(user => { RestResponse.send200(res, user) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

router.get('/', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("user-rest getUser:  Looking for user with a name of " + req.query.userName);
  UserLogic.findUserByUserName(req.query.userName)
    .then(user => { 
      RestResponse.send200(res, user) 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error) 
    })
});

router.post('/', function (req, res) {
  console.log("user-rest createUser: userName found in body = " + req.body.userName);

  UserLogic.createUser({
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
    isSuperUser: false
  })
    .then(user => { RestResponse.send200(res, user) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.put('/:userId', RestUtils.ensureAuthenticated, ensureSuperUserOrSelf, function (req, res) {
  console.log("user-rest updateUser: userName found in body = " + req.body.userName);

  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(currentUser => {
      if (currentUser.isSuperUser) {
        var userData =         
        {
          userName: req.body.userName,
          password: req.body.password,
          emailAddress: req.body.emailAddress,
          isSuperUser: req.body.isSuperUser,
        };
        if (!isUserDataValidForUpdateBySuperUser(userData)) {
          var error = LogicError.INCOMPLETE_INPUT;
          error.message = "At least one of the required user attributes is missing.";
          return Promise.reject(error);
        }
        return UserLogic.updateUser(req.params.userId, userData);
      }
      else {
        var userData = 
        {
          userName: req.body.userName,
          password: req.body.password,
          emailAddress: req.body.emailAddress,
        };

        if (!isUserDataValidForUpdate(userData)) {
          var error = LogicError.INCOMPLETE_INPUT;
          error.message = "At least one of the required user attributes is missing.";
          return Promise.reject(error);
        }
        return UserLogic.updateUser(req.params.userId, userData);
      }
    })
    .then(user => { RestResponse.send200(res, user); })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error); })
});


router.get('/:userId/leagueAsPlayer', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("user-rest getLeaguesForUser:  Looking for legues that this user plays in where UserId = " + req.params.userId);
  UserLogic.getLeaguesAsPlayer(req.params.userId)
    .then(leagues => { 
      RestResponse.send200(res, leagues) 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error) 
    })
});

router.get('/:userId/leagueAsAdmin', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("user-rest getLeaguesAsAdminForUser:  Looking for legues that this user is an admin for  where UserId = " + req.params.userId);
  UserLogic.getLeaguesAsAdmin(req.params.userId)
    .then(leagues => { 
      RestResponse.send200(res, leagues) 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error) 
    })
});

function ensureSuperUserOrSelf(req, res, next) {
  
  // Get the user associated with the token
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(foundUser => {
      // If this is a superuser, we're good to go (call next())
      if (foundUser.isSuperUser) {
        next();
      }
      // Otherwise, this could be a user performing operations on himself
      else {
        // If this user is asking for his own data, that's cool (call next()) 
        if (foundUser.id.toString() === req.params.userId) {
          next();
        }
        // Otherwise, reject the request
        else {
          return Promise.reject({ "name": "NOT_SELF", "message": "User is not self." });
        }
      }
    })
    .catch(error => {
      // If anything goes wrong, we're sending back a 403
      RestResponse.send403(res);
    })
}

function isUserDataValidForUpdate(userData) {
  var result =  userData.userName != null &&
                userData.password != null &&
                userData.emailAddress != null &&
                userData.isSuperUser === undefined;
  return result;
}

function isUserDataValidForUpdateBySuperUser(userData) {
  var result =  userData.userName != null &&
                userData.password != null &&
                userData.emailAddress != null &&
                userData.isSuperUser != null;
  return result;
}

module.exports = router;