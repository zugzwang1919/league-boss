
var Sequelize = require('sequelize');
var sequelize = new Sequelize('leagueboss', 'root', 'tchssoccer', {
  host: 'localhost',
  port: '3306',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

console.log("The dialect our ORM is using = " + sequelize.getDialect());
var userModelUtils = require('./model/user.js');
var User = userModelUtils().definition(sequelize, Sequelize);
userModelUtils().prePopulate(User);





var express = require('express');
var app = express();

// I had to add this to allow localhost:3000 to talk to localhost:1919
// Can't say that I truly understand it
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/user/:userId', function (req, res) {
  console.log("Request received on server!  Looking for user with an id of " + req.params.userId);
  User.findById(req.params.userId)
      .then( user => {
        if (user != null) {
          console.log("Inside then!!!")
          console.log("User info = " + user)
          console.log("User id = " + user.id)
          console.log("User password = " + user.password)
          res.send(user)
        }
        else {
          console.log("user with id " + req.params.userId + " was not found.")
          res.sendStatus(404)
        }  
     });
});
 
app.listen(1919)