// Rest Classes
import {RestResponse} from './rest-response';
import {RestUtil} from './rest-util';

// Logic Classes
import {LogicError} from '../logic/logic-error';
import {UserLogic} from '../logic/user-logic';

// Model Classes
import {ILeague} from '../model/league';
import {ILeagueAttribute, LeagueModelManager} from '../model/league-model-manager';
import {IUser} from '../model/user';
import {IUserInstance, UserModelManager} from '../model/user-model-manager';

// Javascript packages
import * as Promise from 'bluebird';
import * as express from 'express';

export class UserRest {
  private static router: express.Router = express.Router();

  public static getRouter(): express.Router {
    return UserRest.router;
  }

  public static init(): void {
    UserRest.router.get('/:userId', RestUtil.ensureAuthenticated, UserRest.retrieveUserById);
    UserRest.router.get('/', RestUtil.ensureAuthenticated, UserRest.retrieveUser);
    UserRest.router.post('/', UserRest.createUser);
    UserRest.router.put('/:userId', RestUtil.ensureAuthenticated, UserRest.ensureSuperUserOrSelf, UserRest.updateUser);
    UserRest.router.delete('/:userId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, UserRest.deleteUser);
    UserRest.router.get('/:userId/leagueAsPlayer', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesForUser);
    UserRest.router.get('/:userId/leagueAsAdmin', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesAsAdmin);
  }

  private static retrieveUserById(req: express.Request, res: express.Response): any {
    console.log("user-rest getUser:  Looking for user with an id of " + req.params.userId);
    UserLogic.instanceOf().findById(req.params.userId)
      .then((userInstance: IUserInstance) => {
        // Transform the IUserInstance to an IUser (our form that users of our RESTful service should be using)
        const returnedUser: IUser = UserModelManager.createIUserFromAnything(userInstance);
        RestResponse.send200(res, returnedUser);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveUser(req: express.Request, res: express.Response): any {
    console.log("user-rest getUser:  Looking for user with a name of " + req.query.userName);
    UserLogic.instanceOf().findUserByUserName(req.query.userName)
      .then((userInstance: IUserInstance) => {
        // Transform the IUserInstance to an IUser (our form that users of our RESTful service should be using)
        const returnedUser: IUser = UserModelManager.createIUserFromAnything(userInstance);
        RestResponse.send200(res, returnedUser);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static createUser(req: express.Request, res: express.Response): any {
    console.log("user-rest createUser: userName found in body = " + req.body.userName);
    // Transform the request body to an IUser (our form that users of our RESTful service should be using)
    const newUser: IUser = UserModelManager.createIUserFromAnything(req.body);
    // Regardless of what the user sent, set id to undefined and isSuperUser to false
    newUser.id = undefined;
    newUser.isSuperUser = false;

    UserLogic.instanceOf().create(newUser)
      .then((createdUser: IUserInstance) => {
        // Transform the IUserInstance to an IUser (our form that users of our RESTful service should be using)
        const returnedUser: IUser = UserModelManager.createIUserFromAnything(createdUser);
        RestResponse.send200(res, returnedUser);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static updateUser(req: express.Request, res: express.Response): any {
    console.log("user-rest updateUser: userName found in body = " + req.body.userName);
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((currentUser: IUserInstance) => {
        // Transform the request body to an IUser (the form that users of our RESTful service should be using)
        const userNeedingUpdate: IUser = UserModelManager.createIUserFromAnything(req.body);
        // If a SuperUser is making the request
        if (currentUser.isSuperUser) {
          // Make sure the data is complete/valid
          if (!UserRest.isUserDataValidForUpdateBySuperUser(userNeedingUpdate)) {
            const error: LogicError = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
        }
        // ... else a normal user is making the request
        else {
          // Clear out the SuperUser flag, as a regular user cannot make someone a superuser
          userNeedingUpdate.isSuperUser = undefined;
          // Make sure the data is complete/valid
          if (!UserRest.isUserDataValidForUpdate(userNeedingUpdate)) {
            const error: LogicError = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
        }
        return UserLogic.instanceOf().update(userNeedingUpdate);
      })
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static deleteUser(req: express.Request, res: express.Response): any {
    console.log("user-rest deleteUser: userId found in url = " + req.params.userId);
    UserLogic.instanceOf().deleteById(req.params.userId)
      .then((success) => {
        console.log("user-rest deleteUser: successful delete for user id " + req.params.userId + " has occurred.");
        RestResponse.send200(res);
      })
      .catch((error) => {
        console.log("user-rest deleteUser: an error occurred while deleting user id  " + req.params.userId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveLeaguesForUser(req: express.Request, res: express.Response): any {
    console.log("user-rest retriveLeaguesForUser:  Looking for leagues that this user as player for user id " + req.params.userId);
    UserLogic.instanceOf().getLeaguesAsPlayer(req.params.userId)
      .then((leagues: ILeagueAttribute[]) => {
        console.log("user-rest retriveLeaguesForUser: succesful retrival of leagues as player for user id " + req.params.userId);
        // Transform the array of ILeagueAttributes to an array of ILeagues (our form that users of our RESTful service should be using)
        return Promise.map(leagues, LeagueModelManager.createILeagueFromAnything);
      })
      .then((returnLeagues: ILeague[]) => {
        RestResponse.send200(res, returnLeagues);
      })
      .catch((error) => {
        console.log("user-rest retriveLeaguesForUser: an error occurred while retrieving leagues as player for user id " + req.params.userId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveLeaguesAsAdmin(req: express.Request, res: express.Response): any {
    console.log("user-rest retriveLeaguesAsAdmin:  Looking for leagues that this user is an admin for user id " + req.params.userId);
    UserLogic.instanceOf().getLeaguesAsAdmin(req.params.userId)
      .then((leagues: ILeagueAttribute[]) => {
        console.log("user-rest retriveLeaguesAsAdmin: succesful retrival of leagues as admin for  " + req.params.userId);
        // Transform the array of ILeagueAttributes to an array of ILeagues (our form that users of our RESTful service should be using)
        return Promise.map(leagues, LeagueModelManager.createILeagueFromAnything);
      })
      .then((returnLeagues: ILeague[]) => {
        RestResponse.send200(res, returnLeagues);
      })
      .catch((error) => {
        console.log("user-rest retriveLeaguesAsAdmin: an error occurred while retrieving leagues as admin for user id " + req.params.userId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Private Utility Functions

  private static ensureSuperUserOrSelf(req: express.Request, res: express.Response, next: express.NextFunction): any {
    // Get the user associated with the token
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((foundUser) => {
        // If this is a superuser, we're good to go (call next())
        if (foundUser.isSuperUser) {
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
            return Promise.reject({ name: "NOT_SELF", message: "User is not self." });
          }
        }
      })
      .catch((error) => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      });
  }

  private static isUserDataValidForUpdate(userData: IUser): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser === undefined;
    return result;
  }

  private static isUserDataValidForUpdateBySuperUser(userData: IUser): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser != null;
    return result;
  }
}

// Initialize static data
UserRest.init();
