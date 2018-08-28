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
import {ISeasonAttribute, SeasonModelManager} from '../model/season-model-manager';
import {IUser} from '../model/user';
import {IUserAttribute, IUserInstance, UserModelManager} from '../model/user-model-manager';

import * as Promise from 'bluebird';
import * as express from 'express';

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

  private static retrieveLeagueById(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequestWithPromiseBasedTransform( res, "RETRIEVE LEAGUE",
      ((): Promise<ILeagueInstance> => LeagueLogic.instanceOf().findById(req.params.leagueId)),
      ((leagueInstance: ILeagueInstance): Promise<ILeague> => LeagueModelManager.createILeagueFromAnything(leagueInstance)));
  }

  private static createLeague(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequestWithPromiseBasedTransform( res, "UPDATE LEAGUE",
      ((): Promise<ILeagueInstance> => {
        let adminUser: IUserInstance;
        return new Promise<ILeagueInstance>((resolve, reject) => {
          return UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
            .then((foundUser: IUserInstance) => {
              adminUser = foundUser;
              return LeagueModelManager.createILeagueFromAnything(req.body);
            })
            .then((leagueToBeCreated: ILeague) => {
              leagueToBeCreated.id = undefined;
              return LeagueLogic.instanceOf().createLeagueWithUserAsAdmin(leagueToBeCreated, adminUser.id);
            })
            .then((createdLeague: ILeagueInstance) => resolve(createdLeague))
            .catch((error: any) => reject(error));
        });
      }),
      ((leagueInstance: ILeagueInstance): Promise<ILeague> => LeagueModelManager.createILeagueFromAnything(leagueInstance)));
  }

  private static updateLeague(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "UPDATE LEAGUE",
      ((): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
          return LeagueModelManager.createILeagueFromAnything(req.body)
          .then((leagueToBeUpdated: ILeague) => LeagueLogic.instanceOf().update(leagueToBeUpdated))
          .then((result: boolean) => resolve(result))
          .catch((error: any) => reject(error));
        });
      }));
  }

  private static deleteLeague(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "DELETE LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().deleteById(req.params.leagueId)));
  }

  // Players in this league

  private static retrievePlayers(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "RETRIEVE PLAYERS IN LEAGUE",
      (): Promise<IUserAttribute[]> => LeagueLogic.instanceOf().getPlayers(req.params.leagueId),
      (players: IUser[]) => players.map(UserModelManager.createIUserFromAnything));
  }

  private static addPlayer(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "ADD PLAYER TO LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().addPlayer(req.params.leagueId, req.body.userId)));
  }

  private static removePlayer(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "REMOVE PLAYER FROM LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().removePlayer(req.params.leagueId, req.params.userId)));
  }

  // Admins in this league

  private static retrieveAdmins(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "RETRIEVE ADMINS IN LEAGUE",
      (): Promise<IUserAttribute[]> => LeagueLogic.instanceOf().getAdmins(req.params.leagueId),
      (admins: IUser[]) => admins.map(UserModelManager.createIUserFromAnything));
  }

  private static addAdmin(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "ADD ADMIN TO LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().addAdmin(req.params.leagueId, req.body.userId)));
  }

  private static deleteAdmin(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "REMOVE ADMIN FROM LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().removeAdmin(req.params.leagueId, req.params.userId)));
  }

  // Season

  private static retrieveSeason(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "RETRIEVE SEASON IN LEAGUE",
      ((): Promise<ISeasonAttribute> => LeagueLogic.instanceOf().getSeason(req.params.leagueId)),
      ((seasonAttribute: ISeasonAttribute) => SeasonModelManager.createISeasonFromAnything(seasonAttribute)));
  }

  private static setSeason(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicLayerRequest( res, "SET SEASON IN LEAGUE",
      ((): Promise<boolean> => LeagueLogic.instanceOf().setSeason(req.params.leagueId, req.body.seasonId)));
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
