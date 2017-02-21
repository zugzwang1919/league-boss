

// Prepopulate the DB... 
// Comment out these lines most of the time.
var DefineUserFunction = require('./model/user');
var User = DefineUserFunction();
User.sync({ force: true })
  .then(function () {
    console.log("Request received to pre-populate Users")
    User.create({
      userName: 'RWW',
      password: 'RWW',
      emailAddress: 'russ.wolfe@gmail.com',

    })
    User.create({
      userName: 'TB',
      password: 'TB',
      emailAddress: 'tom.brady@gmail.com',

    })
  })




var express = require('express');
var app = express();

// Indicate that we'll be using JSON in the bodies of requests and responses
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(bodyParser.json());


// I had to add this to allow javascript served from localhost:3000 to talk to localhost:1919
// Can't say that I truly understand it
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Wolfe-Authentication-Token");
  res.header("Access-Control-Expose-Headers", "Wolfe-Authentication-Token");
  next();
});

// Routes to our REST code
var userRoutes = require('./rest/user-rest');
app.use('/user', userRoutes);
var loginRoutes = require('./rest/login-rest');
app.use("/", loginRoutes);

// Finally tell the express to listen on port 1919
app.listen(1919)


