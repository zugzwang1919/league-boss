
var express = require('express');
var router  = express.Router();
var loginLogicUtils = require('../logic/login-logic');
var restUtils = require('./rest-util.js');


router.post('/login', function(req, res) {
  console.log("login-rest login: username found in body = " + req.body.userName);
  console.log("login-rest login: password found in body = " + req.body.password);

  loginLogicUtils().login({
    userName: req.body.userName,
    password: req.body.password,
    },
    function (err, data) {
      if (err) {
        console.log("login-rest login callback has been entered.  An error occurred.");
        console.log("error message = " + data);
        res.statusCode = 401;
        res.json(restUtils().buildJSONfromMessage(data));
      }
      else {
        console.log("login-rest login callback has been entered. Everything was fine.");
        console.log("data.wolfeAuthenticationToken = " + data.wolfeAuthenticationToken);
        res.append('Wolfe-Authentication-Token', data.wolfeAuthenticationToken);
        res.sendStatus(200);
      }
  }) ;

});
module.exports = router;