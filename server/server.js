

// Prepopulate the DB... 
// Comment out these lines most of the time.
var DefineUserFunction = require('./model/user');
var User = DefineUserFunction();
var DefineLeagueFunction = require('./model/league');
var League = DefineLeagueFunction();

var user1;
var user2;
var league1;


User.belongsToMany(League, { as: 'LeagueAsPlayer', through: 'LeaguePlayer' });
League.belongsToMany(User, { as: 'Player', through: 'LeaguePlayer' });


var sequelize = require('./model/index');

sequelize.sync({ force: true })
  .then(function () {
    return User.create({
      userName: 'RWW',
      password: 'RWW',
      emailAddress: 'russ.wolfe@gmail.com',

    })
  })
  .then(user => { 
    user1 = user 
  })
  .then(function () {
    return User.create({
      userName: 'TB',
      password: 'TB',
      emailAddress: 'tom.brady@gmail.com',

    })
  })
  .then(user => { 
    user2 = user 
  })
  .then(function () {
    return League.create({
      leagueName: 'NFL Chumps',
      description: 'The worst collection ever of NFL enthusiasts.'
    })
  })
  .then(league => {
    league1 = league;
    return league1.addPlayer(user1);
  })
  .then(junk => {
    return league1.addPlayer(user2);
  })
  .catch(err => {
    console.log("error name = " + err.name + ".  Error Message = " + err.message)
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


