

// Prepopulate the DB... 
// Comment out these lines most of the time.
var DataModel = require('./model/dataModel');
var USER = DataModel.USER;
var LEAGUE = DataModel.LEAGUE;
var SEASON = DataModel.SEASON;


var user1;
var user2;
var league1;
var league2;
var season1;



var sequelize = require('./model/index');
sequelize.sync({ force: true })
  .then(function () {
    return USER.create({
      userName: 'RWW',
      password: 'RWW',
      emailAddress: 'russ.wolfe@gmail.com',
      isSuperUser: true,
    })
  })
  .then(user => {
    user1 = user;
    return USER.create({
      userName: 'TB',
      password: 'TB',
      emailAddress: 'tom.brady@gmail.com',
      isSuperUser: false,
    })
  })
  .then(user => {
    user2 = user;
    SEASON.create({
      seasonName: 'College Football 2017-18',
      beginDate: '2017/08/22',
      endDate: '2018/01/08'
    })
    SEASON.create({
      seasonName: 'NBA 2017-18',
      beginDate: '2017/10/02',
      endDate: '2018/06/12'
    })
    return SEASON.create({
      seasonName: 'NFL 2017-18',
      beginDate: '2017/09/01',
      endDate: '2018/02/10'
    })
  })
  .then(season => {
    season1 = season;
    return LEAGUE.create({
      leagueName: 'NFL Chumps',
      description: 'The worst collection ever of NFL enthusiasts.'
    })
  })
  .then(league => {
    league1 = league;
    league1.addSeason(season1);
    league1.addPlayer(user1);
    league1.addPlayer(user2);
    league1.addAdmin(user1);
    league1.addAdmin(user2);
    return LEAGUE.create({
      leagueName: 'Winners not Weiners',
      description: 'Yeah, we are that good.'
    })
  })
  .then(league => {
    league2 = league;
    league2.addSeason(season1);
    league2.addPlayer(user2);
    return league2.addAdmin(user2);
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
var userRoutes = require('./rest/league-rest');
app.use('/league', userRoutes);
var seasonRoutes = require('./rest/season-rest');
app.use("/season", seasonRoutes);
var loginRoutes = require('./rest/login-rest');
app.use("/", loginRoutes);

// Finally tell the express to listen on port 1919
app.listen(1919)


