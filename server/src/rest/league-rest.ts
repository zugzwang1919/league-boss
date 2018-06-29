// Rest Layer Classes
import {RestResponse} from './rest-response';
import {RestUtil} from './rest-util';

// Logic Layer Classes
import {LeagueLogic} from '../logic/league-logic';
import {UserLogic} from '../logic/user-logic';

// Model Layer Classes
import {ILeague} from '../model/league';
import {LeagueModelManager} from '../model/league-model-manager';
import {ILeagueInstance} from '../model/league-model-manager';
import {ISeason} from '../model/season';
import {SeasonModelManager} from '../model/season-model-manager';
import {IUser} from '../model/user';
import {IUserAttribute, IUserInstance, UserModelManager} from '../model/user-model-manager';

import * as express from 'express';
import { ISeasonAttribute } from '../model/season-model-manager';

export class LeagueRest {

  private static router: express.Router = express.Router();

  public static getRouter(): express.Router {
    return LeagueRest.router;
  }

  public static init(): void {
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
    // Season associated with this league
    LeagueRest.router.get('/:leagueId/season', RestUtil.ensureAuthenticated, LeagueRest.retrieveSeason);
    LeagueRest.router.put('/:leagueId/season', RestUtil.ensureAuthenticated, LeagueRest.ensureSuperUserOrLeagueAdmin, LeagueRest.setSeason);

  }

  private static retrieveLeagueById(req: express.Request, res: express.Response): any {
    console.log("Request received on server!  Looking for league with an id of " + req.params.leagueId);
    LeagueLogic.instanceOf().findById(req.params.leagueId)
      .then((foundLeague: ILeagueInstance) => {
        // Transform the ILeagueInstance to an ILeague (our form that users of our RESTful service should be using)
        return LeagueModelManager.createILeagueFromAnything(foundLeague);
      })
      .then((returnLeague: ILeague) => {
        RestResponse.send200(res, returnLeague);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static createLeague(req: express.Request, res: express.Response): any {
    console.log("league-rest createLeague: leagueName found in body = " + req.body.leagueName);
    let user: IUserInstance;
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((foundUser: IUserInstance) => {
        // Transform the message body to an ILeague (our form that users of our RESTful service should be using)
        user = foundUser;
        return LeagueModelManager.createILeagueFromAnything(req.body);
      })
      .then((inputLeague: ILeague) => {
        // The caller doesn't get to define the id
        inputLeague.id = undefined;
        return LeagueLogic.instanceOf().createLeagueWithUserAsAdmin(inputLeague, user.id);
      })
      .then((createdLeague: ILeagueInstance) => {
        // Transform the ILeagueInstance to an ILeague (our form that users of our RESTful service should be using)
        return LeagueModelManager.createILeagueFromAnything(createdLeague);
      })
      .then((returnLeague: ILeague) => {
        RestResponse.send200(res, returnLeague);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static updateLeague(req: express.Request, res: express.Response): any {
    console.log("league-rest updateLeague: leagueName found in body = " + req.body.leagueName);
    // Transform the message body to an ILeague (our form that users of our RESTful service should be using)
    return LeagueModelManager.createILeagueFromAnything(req.body)
      .then((inputLeague: ILeague) => {
        LeagueLogic.instanceOf().update(inputLeague);
      })
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static deleteLeague(req: express.Request, res: express.Response): any {
    console.log("league-rest deleteLeague: leagueId found in url = " + req.params.leagueId);

    LeagueLogic.instanceOf().deleteById(req.params.leagueId)
      .then((success) => {
        console.log("league-rest deleteLeague: successful delete for league id " + req.params.leagueId + " has occurred.");
        RestResponse.send200(res);
      })
      .catch((error) => {
        console.log("user-rest deleteLeague: an error occurred while deleting league id  " + req.params.leagueId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Players in this league

  private static retrievePlayers(req: express.Request, res: express.Response): any {
    console.log("league-rest getPlayers:  ");
    LeagueLogic.instanceOf().getPlayers(req.params.leagueId)
      .then((players: IUserAttribute[]) => {
        // Send back an array of IUsers (our form that users of our RESTful service should be using) rather than IUserInstances
        const returnPlayers: IUser[] = players.map(UserModelManager.createIUserFromAnything);
        RestResponse.send200(res, returnPlayers);
      })
      .catch((error) => { RestResponse.sendAppropriateResponse(res, error); });
  }

  private static addPlayer(req: express.Request, res: express.Response): any {
    console.log("league-rest addPlayer: userId found in body = " + req.body.userId);
    LeagueLogic.instanceOf().addPlayer(req.params.leagueId, req.body.userId)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static removePlayer(req: express.Request, res: express.Response): any {
    console.log("league-rest removeAdmin: userId found in URL = " + req.params.userId);
    LeagueLogic.instanceOf().removePlayer(req.params.leagueId, req.params.userId)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Admins in this league

  private static retrieveAdmins(req: express.Request, res: express.Response): any {
    console.log("league-rest retrieveAdmins: leagueId found in URL = " + req.params.leagueId);
    LeagueLogic.instanceOf().getAdmins(req.params.leagueId)
      .then((admins: IUserAttribute[]) => {
        // Send back an array of IUsers (our form that users of our RESTful service should be using) rather than IUserInstances
        const returnPlayers: IUser[] = admins.map(UserModelManager.createIUserFromAnything);
        RestResponse.send200(res, returnPlayers);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static addAdmin(req: express.Request, res: express.Response): any {
    console.log("league-rest addAdmin: userId found in body = " + req.body.userId);
    LeagueLogic.instanceOf().addAdmin(req.params.leagueId, req.body.userId)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static deleteAdmin(req: express.Request, res: express.Response): any {
    console.log("league-rest deleteAdmin: userId found in URL = " + req.params.userId);
    LeagueLogic.instanceOf().removeAdmin(req.params.leagueId, req.params.userId)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Season

  private static retrieveSeason(req: express.Request, res: express.Response): any {
    console.log("league-rest retrieveSeason: leagueId found in URL = " + req.params.leagueId);
    return LeagueLogic.instanceOf().getSeason(req.params.leagueId)
      .then((foundSeason: ISeasonAttribute) => {
        const returnSeason: ISeason =  SeasonModelManager.createISeasonFromAnything(foundSeason);
        RestResponse.send200(res, returnSeason);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static setSeason(req: express.Request, res: express.Response): any {
    console.log("league-rest setSeason: leagueId found in URL = " + req.params.leagueId);
    return LeagueLogic.instanceOf().setSeason(req.params.leagueId, req.body.seasonId)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Utility functions

  private static ensureSuperUserLeagueAdminOrPlayer(req: express.Request, res: express.Response, next: express.NextFunction): any {

    // Get the user associated with the token
    let foundUser: IUserInstance;
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((user: IUserInstance) => {
        foundUser = user;
        return UserLogic.instanceOf().isLeagueAdminOrPlayer(user.id, req.params.leagueId);
      })
      .then((isLeagueAdminOrPlayer: boolean) => {
        if (isLeagueAdminOrPlayer || foundUser.isSuperUser) {
          next();
        }
      })
      .catch((error) => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      });
  }

  private static ensureSuperUserOrLeagueAdmin(req: express.Request, res: express.Response, next: express.NextFunction): any {

    // Get the user associated with the token
    let foundUser: IUserInstance;
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((user: IUserInstance) => {
        foundUser = user;
        return UserLogic.instanceOf().isLeagueAdmin(user.id, req.params.leagueId);
      })
      .then((isLeagueAdmin: boolean) => {
        if (isLeagueAdmin || foundUser.isSuperUser) {
          next();
        }
        else {
          RestResponse.send403(res);
        }
      })
      .catch((error) => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      });
  }

}

// Initialize all static data
LeagueRest.init();
