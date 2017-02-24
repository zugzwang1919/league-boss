
var express = require('express');
var router = express.Router();
var LoginLogic = require('../logic/login-logic');
var RestResponse = require('./rest-response');

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
    .catch(errorMessage => { RestResponse.send401(res) });
});
module.exports = router;