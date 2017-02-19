
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');



router.get('/:userId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("Request received on server!  Looking for user with an id of " + req.params.userId);
  console.log("User Id added = " + req.header('Wolfe-User-Id'));
  UserLogic.findUserById(req.params.userId)
    .then(user => { RestResponse.send200(res, user) } )
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) } )
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
    .then(user => { RestResponse.send200(res) } )
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) } )
});


router.put('/:userId', function (req, res) {
  console.log("user-rest updateUser: userName found in body = " + req.body.userName);
  console.log("user-rest updateUser: password found in body = " + req.body.password);
  console.log("user-rest updateUser: emailAddress found in body = " + req.body.emailAddress);

  UserLogic.updateUser({
    id: req.body.id,
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => { RestResponse.send200(res) } )
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) } )
});

module.exports = router;