
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');



router.get('/:userId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("user-rest getUser:  Looking for user with an id of " + req.params.userId);
  UserLogic.findUserById(req.params.userId)
    .then(user => { RestResponse.send200(res, user) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.post('/', function (req, res) {
  console.log("user-rest createUser: userName found in body = " + req.body.userName);

  UserLogic.createUser({
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => { RestResponse.send200(res, user) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.put('/:userId', RestUtils.ensureAuthenticated, ensureSuperUserOrSelf, function (req, res) {
  console.log("user-rest updateUser: userName found in body = " + req.body.userName);

  UserLogic.updateUser({
    id: req.params.userId,
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => { RestResponse.send200(res, user); })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error); })
});

function ensureSuperUserOrSelf(req, res, next) {
    var foundUser;
  // Get the user associated with the token
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(user => {
      foundUser = user;
      return UserLogic.isSuperUser(foundUser);
    })
    // Check on SuperUser Status or Self status
    .then(isSuperUser => {
      // If this is a superuser, we're good to go (call next())
      if (isSuperUser) {
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

module.exports = router;