
var express = require('express');
var router = express.Router();
var userModelUtils = require('../model/user');
var User = userModelUtils().definition();
var userLogicUtils = require('../logic/user-logic');
var restUtils = require('./rest-util.js');



router.get('/:userId', restUtils().validateUser, function (req, res) {
  console.log("Request received on server!  Looking for user with an id of " + req.params.userId);
  User.findById(req.params.userId)
    .then(user => {
      if (user != null) {
        console.log("User name = " + user.userName)
        console.log("User password = " + user.password)
        console.log("User email address = " + user.emailAddress)
        res.send(user)
      }
      else {
        console.log("user with id " + req.params.userId + " was not found.")
        res.sendStatus(404)
      }
    });
});

router.post('/create', function (req, res) {
  console.log("user-rest createUser: userName found in body = " + req.body.userName);
  console.log("user-rest createUser: password found in body = " + req.body.password);
  console.log("user-rest createUser: emailAddress found in body = " + req.body.emailAddress);

  userLogicUtils().createUser({
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  })
    .then(user => {
      console.log("user-rest createUser callback has been entered. Everything was fine.");
      res.statusCode = 200;
      res.json(restUtils().buildJSONfromMessage("Success!"));
    })
    .catch(error => {
      console.log("user-rest createUser callback has been entered.  An error occurred.");
      console.log("error message = " + error);
      res.statusCode = 400;
      res.json(restUtils().buildJSONfromMessage(error));

    })
});



router.put('/:userId', function (req, res) {
  console.log("user-rest updateUser: userName found in body = " + req.body.userName);
  console.log("user-rest updateUser: password found in body = " + req.body.password);
  console.log("user-rest updateUser: emailAddress found in body = " + req.body.emailAddress);

  userLogicUtils().updateUser({
    id: req.body.id,
    userName: req.body.userName,
    password: req.body.password,
    emailAddress: req.body.emailAddress,
  },
    function (err, data) {
      if (err) {
        console.log("user-rest updateUser callback has been entered.  An error occurred.");
        console.log("error message = " + data);
        res.statusCode = 400;
        res.json(restUtils().buildJSONfromMessage(data));
      }
      else {
        console.log("user-rest createUser callback has been entered. Everything was fine.");
        res.statusCode = 200;
        res.json(restUtils().buildJSONfromMessage("Success!"));
      }
    });
});
module.exports = router;