
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var LeagueLogic = require('../logic/league-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');



router.get('/:leagueId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("Request received on server!  Looking for league with an id of " + req.params.leagueId);
  LeagueLogic.findLeagueById(req.params.userId)
    .then(league => { RestResponse.send200(res, league) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});


router.post('/', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("league-rest createLeague: leagueName found in body = " + req.body.leagueName);

  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(user => {
      return LeagueLogic.createLeague(
        {
          leagueName: req.body.leagueName,
          description: req.body.description,
        },
        { userId: user.id })
    })
    .then(league => { 
      RestResponse.send200(res, league) 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error) 
    })
});


router.put('/:leagueId', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("user-rest updateLeague: leagueName found in body = " + req.body.leagueName);

  LeagueLogic.updateLeague({
    id: req.body.id,
    leagueName: req.body.leagueName,
    description: req.body.description,
  })
    .then(league => { RestResponse.send200(res, league); })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error); })
});

router.post('/:leagueId/player', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest addPlayer: userId found in body = " + req.body.userId);

  LeagueLogic.addPlayer({
    userId: req.body.userId,
  })
    .then(league => { RestResponse.send200(res, league) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

router.post('/:leagueId/admin', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest addAddmin: userId found in body = " + req.body.userId);

  LeagueLogic.addAdmin({
    userId: req.body.userId,
  })
    .then(league => { RestResponse.send200(res, league) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

function ensureSuperUserOrLeagueAdmin(req, res, next) {
  var foundUser;
  // Get the user associated with the token
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(user => {
      foundUser = user;
      return UserLogic.isSuperUser(foundUser);
    })
    // Check on SuperUser Status or Self status
    .then(isSuperUser => {
      // If this is a superuser, we're good to go (call next())
      if (isSuperUser) {
        next();
      }
      // Otherwise, this could be a user performing operations on himself
      else {
        // If this user is asking for his own data, that's cool (call next()) 
        if (foundUser.id.toString() === req.params.userId) {
          next();
        }
        // Otherwise, reject the request
        else {
          return Promise.reject({ "name": "NOT_SELF", "message": "User is not self." });
        }
      }
    })
    .catch(error => {
      // If anything goes wrong, we're sending back a 403
      RestResponse.send403(res);
    })
}

module.exports = router;