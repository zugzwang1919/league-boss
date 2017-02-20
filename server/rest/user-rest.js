
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');



router.get('/:userId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("Request received on server!  Looking for user with an id of " + req.params.userId);
  console.log("User Id added = " + req.header('Wolfe-User-Id'));
  UserLogic.findUserById(req.params.userId)
    .then(user => { RestResponse.send200(res, user) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.post('/create', function (req, res) {
  console.log("user-rest createUser: userName found in body = " + req.body.userName);
  console.log("user-rest createUser: password found in body = " + req.body.password);
  console.log("user-rest createUser: emailAddress found in body = " + req.body.emailAddress);

  UserLogic.createUser({
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => { RestResponse.send200(res) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.put('/:userId', RestUtils.ensureAuthenticated, ensureSuperUserOrSelf, function (req, res) {
  console.log("user-rest updateUser: userName found in body = " + req.body.userName);
  console.log("user-rest updateUser: password found in body = " + req.body.password);
  console.log("user-rest updateUser: emailAddress found in body = " + req.body.emailAddress);

  UserLogic.updateUser({
    id: req.body.id,
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => { RestResponse.send200(res) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

function ensureSuperUserOrSelf(req, res, next) {
  var token = req.header('Wolfe-Authentication-Token');
  var foundUser;
  // Get the user associated with the token
  UserLogic.findUserByAuthenticationToken(token)
    .then(user => {
      foundUser = user;
      return UserLogic.isSuperUser(foundUser)
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
        if (foundUser.id == req.params.userId) {
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
      RestResponse.send403(res)
    })
}

module.exports = router;