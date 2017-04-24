
var express = require('express');
var router = express.Router();
var LoginLogic = require('../logic/login-logic');
var UserLogic = require('../logic/user-logic');
var RestResponse = require('./rest-response');
console.log("inside login-rest, User Logic ID = " + UserLogic.getIdentification());

router.post('/login', function (req, res) {
  console.log("login-rest login: username found in body = " + req.body.userName);
  console.log("login-rest login: password found in body = " + req.body.password);

  LoginLogic.login({
    userName: req.body.userName,
    password: req.body.password,
  })
    .then(data => {
      RestResponse.send200WithHeader(res, "Wolfe-Authentication-Token", data.wolfeAuthenticationToken, {"message": "Success!!!", "user": data.user})
    })
    // Anytime login fails, we send back the same thing (not trying to provide too much info)
    .catch(errorMessage => { RestResponse.send401(res, "User Name and password do not match.") });
});

router.post('/logout', function (req, res) {
  console.log("login-rest logout requested: ");
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
  .then(user => {
    return LoginLogic.logout(user.userName)
  })
  .then( junk => {
    RestResponse.send200(res);
  })
  .catch( error => {
    RestResponse.sendAppropriateResponse(res, error)
  })
  
});

module.exports = router;