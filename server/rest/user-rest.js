
var express = require('express');
var router  = express.Router();
var userModelUtils = require('../model/user');
var User = userModelUtils().definition();



router.get('/:userId', function (req, res) {
  console.log("Request received on server!  Looking for user with an id of " + req.params.userId);
  User.findById(req.params.userId)
      .then( user => {
        if (user != null) {
          console.log("Inside then!!!")
          console.log("User id = " + user.id)
          console.log("Name = " + user.name)
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

router.post('/create', function(req, res) {
  console.log("name found in body = " + req.body.name);
  console.log("username found in body = " + req.body.username);
  console.log("password found in body = " + req.body.password);
  console.log("emailAddress found in body = " + req.body.emailAddress);

  User.create({
      name: req.body.name,
      userName: req.body.userName,
      password: req.body.password,
      emailAddress: req.body.emailAddress,
    })
    .then(function() {
      console.log(req.body.userName + " was successfully created.");
      res.sendStatus(200);
  });
});
module.exports = router;