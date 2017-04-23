
var express = require('express');
var router = express.Router();
var UserLogic = require('../logic/user-logic');
var LeagueLogic = require('../logic/league-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');



router.get('/:leagueId', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("Request received on server!  Looking for league with an id of " + req.params.leagueId);
  LeagueLogic.findLeagueById(req.params.leagueId)
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
          leagueTypeIndex: req.body.leagueTypeIndex,
          seasonTypeIndex: req.body.seasonTypeIndex
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
    id: req.params.leagueId,
    leagueName: req.body.leagueName,
    description: req.body.description,
    leagueTypeIndex: req.body.leagueTypeIndex,
    seasonTypeIndex: req.body.seasonTypeIndex
  })
    .then(league => { RestResponse.send200(res, league); })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error); })
});


// Players in this league

router.get('/:leagueId/player', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("league-rest getPlayers:  ");
  LeagueLogic.getPlayers(req.params.leagueId)
    .then(players => { RestResponse.send200(res, players) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

router.post('/:leagueId/player', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest addPlayer: userId found in body = " + req.body.userId);
  LeagueLogic.addPlayer(req.params.leagueId, req.body.userId)
    .then(success => { 
      RestResponse.send200(res);
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error);
    })
});

router.delete('/:leagueId/player/:userId', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest removeAddmin: userId found in URL = " + req.params.userId);
  LeagueLogic.removePlayer(req.params.leagueId, req.params.userId)
    .then( success => { 
      RestResponse.send200(res); 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error);
    })
});



// Admins in this league

router.get('/:leagueId/admin', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("league-rest getAddmins: leagueId found in body = " + req.params.leagueId);
  LeagueLogic.getAdmins(req.params.leagueId)
    .then(admins => { RestResponse.send200(res, admins) })
    .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
});

router.post('/:leagueId/admin', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest addAddmin: userId found in body = " + req.body.userId);
  LeagueLogic.addAdmin(req.params.leagueId, req.body.userId)
    .then(success => { 
      RestResponse.send200(res); 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error);
    })
});

router.delete('/:leagueId/admin/:userId', RestUtils.ensureAuthenticated, ensureSuperUserOrLeagueAdmin, function (req, res) {
  console.log("league-rest removeAddmin: userId found in URL = " + req.params.userId);
  LeagueLogic.removeAdmin(req.params.leagueId, req.params.userId)
    .then(success => { 
      RestResponse.send200(res); 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error);
    })
});


function ensureSuperUserOrLeagueAdmin(req, res, next) {

  // Get the user associated with the token
  var foundUser;
  UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(user => {
      foundUser = user;
      return UserLogic.isLeagueAdmin(user, req.params.leagueId)
    })
    .then(isLeagueAdmin => {
      if (isLeagueAdmin || foundUser.isSuperUser)
        next()
      else
        RestResponse.send403(res);
    })
    .catch(error => {
      // If anything goes wrong, we're sending back a 403
      RestResponse.send403(res);
    })
}

module.exports = router;