

// Prepopulate the DB... 
// Comment out these lines most of the time.
var UserModelUtils = require('./model/user');
var User = UserModelUtils.definition();
UserModelUtils.prePopulate(User);



var express = require('express');
var app = express();

// Indicate that we'll be using JSON in the bodies of requests and responses
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(bodyParser.json());


// I had to add this to allow javascript served from localhost:3000 to talk to localhost:1919
// Can't say that I truly understand it
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Routes to our REST code
var userRoutes  = require('./rest/user-rest');
app.use('/user', userRoutes);
var loginRoutes = require('./rest/login-rest');
app.use("/", loginRoutes);

// Finally tell the express to listen on port 1919
app.listen(1919)


