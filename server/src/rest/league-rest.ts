// Rest Layer Classes
import {RestUtil} from './rest-util';
import {RestResponse} from './rest-response';

// Logic Layer Classes
import {UserLogic} from '../logic/user-logic';
import {LeagueLogic} from '../logic/league-logic';

import * as express from 'express';

export class LeagueRest {

  private static router: express.Router = express.Router();  

  static getRouter(): express.Router {
    return LeagueRest.router;
  }

  static init() {
    LeagueRest.router.get('/:leagueId', RestUtil.ensureAuthenticated, LeagueRest.retrieveLeagueById);
    LeagueRest.router.post('/', RestUtil.ensureAuthenticated, LeagueRest.createLeague); 
    LeagueRest.router.put('/:leagueId', RestUtil.ensureAuthenticated, LeagueRest.ensureSuperUserOrLeagueAdmin, LeagueRest.updateLeague);
    LeagueRest.router.delete('/:leagueId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, LeagueRest.deleteLeague);
    // Players in this league
    LeagueRest.router.get('/:leagueId/player', RestUtil.ensureAuthenticated, LeagueRest.retrievePlayers);
    LeagueRest.router.post('/:leagueId/player', RestUtil.ensureAuthenticated, LeagueRest.addPlayer);
    LeagueRest.router.delete('/:leagueId/player/:userId', RestUtil.ensureAuthenticated, LeagueRest.ensureSuperUserOrLeagueAdmin, LeagueRest.removePlayer); 
    // Admins in this league
    LeagueRest.router.get('/:leagueId/admin', RestUtil.ensureAuthenticated, LeagueRest.retrieveAdmins);
    LeagueRest.router.post('/:leagueId/admin', RestUtil.ensureAuthenticated, LeagueRest.ensureSuperUserOrLeagueAdmin, LeagueRest.addAdmin);
    LeagueRest.router.delete('/:leagueId/admin/:userId', RestUtil.ensureAuthenticated, LeagueRest.ensureSuperUserOrLeagueAdmin, LeagueRest.deleteAdmin);
  }

  private static retrieveLeagueById (req, res) {
    console.log("Request received on server!  Looking for league with an id of " + req.params.leagueId);
    LeagueLogic.findLeagueById(req.params.leagueId)
      .then(league => { RestResponse.send200(res, league) })
      .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
  }

  private static createLeague(req, res) {
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
  }

  private static updateLeague(req, res) {
    console.log("league-rest updateLeague: leagueName found in body = " + req.body.leagueName);
    LeagueLogic.updateLeague({
      id: req.params.leagueId,
      leagueName: req.body.leagueName,
      description: req.body.description,
      leagueTypeIndex: req.body.leagueTypeIndex,
      seasonTypeIndex: req.body.seasonTypeIndex
    })
      .then(league => { RestResponse.send200(res, league); })
      .catch(error => { RestResponse.sendAppropriateResponse(res, error); })
  }
  
  private static deleteLeague(req, res) {
    console.log("league-rest deleteLeague: entering");
    console.log("league-rest deleteLeague: leagueId found in url = " + req.params.leagueId);
  
    LeagueLogic.deleteLeague(req.params.leagueId)
      .then(success => {
        console.log("league-rest deleteLeague: successful delete for league id " + req.params.leagueId + " has occurred.");
        RestResponse.send200(res);
      })
      .catch(error => {
        console.log("user-rest deleteLeague: an error occurred while deleting league id  " + req.params.leagueId);
        RestResponse.sendAppropriateResponse(res, error);
      })
  }
  
  // Players in this league

  private static retrievePlayers(req, res) {
    console.log("league-rest getPlayers:  ");
    LeagueLogic.getPlayers(req.params.leagueId)
      .then(players => { RestResponse.send200(res, players) })
      .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
  }


  private static addPlayer(req, res) {
    console.log("league-rest addPlayer: userId found in body = " + req.body.userId);
    LeagueLogic.addPlayer(req.params.leagueId, req.body.userId)
      .then(success => { 
        RestResponse.send200(res);
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error);
      })
  }
  
  private static removePlayer(req, res) {
    console.log("league-rest removeAddmin: userId found in URL = " + req.params.userId);
    LeagueLogic.removePlayer(req.params.leagueId, req.params.userId)
      .then( success => { 
        RestResponse.send200(res); 
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error);
      })
  }

  // Admins in this league

  private static retrieveAdmins(req, res) {
    console.log("league-rest getAddmins: leagueId found in body = " + req.params.leagueId);
    LeagueLogic.getAdmins(req.params.leagueId)
      .then(admins => { RestResponse.send200(res, admins) })
      .catch(error => { RestResponse.sendAppropriateResponse(res, error) })
  }
  
  private static addAdmin(req, res) {
    console.log("league-rest addAddmin: userId found in body = " + req.body.userId);
    LeagueLogic.addAdmin(req.params.leagueId, req.body.userId)
      .then(success => { 
        RestResponse.send200(res); 
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error);
      })
  }

  private static deleteAdmin(req, res) {
    console.log("league-rest removeAddmin: userId found in URL = " + req.params.userId);
    LeagueLogic.removeAdmin(req.params.leagueId, req.params.userId)
      .then(success => { 
        RestResponse.send200(res); 
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error);
      })
  }

  // Utility functions

  private static ensureSuperUserOrLeagueAdmin(req, res, next) {
    
      // Get the user associated with the token
      var foundUser;
      UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
        .then(user => {
          foundUser = user;
          return UserLogic.isLeagueAdmin(user.id, req.params.leagueId)
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
  }

  // Initialize all static data
  LeagueRest.init();






