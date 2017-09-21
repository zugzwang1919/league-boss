// Rest Classes
import {RestResponse} from './rest-response';
import {RestUtil} from './rest-util';

// Logic Classes
import {LogicError} from '../logic/logic-error';
import {UserLogic} from '../logic/user-logic';

// Model Classes
import {IUserAttribute} from '../model/user-model-manager';

// Javascript packages
import * as express from 'express';

export class UserRest {
  private static router: express.Router = express.Router();

  public static getRouter(): express.Router {
    return UserRest.router;
  }

  public static init() {
    UserRest.router.get('/:userId', RestUtil.ensureAuthenticated, UserRest.retrieveUserById);
    UserRest.router.get('/', RestUtil.ensureAuthenticated, UserRest.retrieveUser);
    UserRest.router.post('/', UserRest.createUser);
    UserRest.router.put('/:userId', RestUtil.ensureAuthenticated, UserRest.ensureSuperUserOrSelf, UserRest.updateUser);
    UserRest.router.delete('/:userId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, UserRest.deleteUser);
    UserRest.router.get('/:userId/leagueAsPlayer', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesForUser);
    UserRest.router.get('/:userId/leagueAsAdmin', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesAsAdmin);
  }

  private static retrieveUserById(req: express.Request, res: express.Response) {
    console.log("user-rest getUser:  Looking for user with an id of " + req.params.userId);
    UserLogic.findUserById(req.params.userId)
      .then((user) => {
        RestResponse.send200(res, user);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveUser(req: express.Request, res: express.Response) {
    console.log("user-rest getUser:  Looking for user with a name of " + req.query.userName);
    UserLogic.findUserByUserName(req.query.userName)
      .then((user) => {
        RestResponse.send200(res, user);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static createUser(req: express.Request, res: express.Response) {
    console.log("user-rest createUser: userName found in body = " + req.body.userName);
    const newUser: IUserAttribute = {
      userName: req.body.userName,
      password: req.body.password,
      emailAddress: req.body.emailAddress,
      isSuperUser: false,
    };
    UserLogic.createUser(newUser)
      .then((createdUser) => {
        RestResponse.send200(res, createdUser);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static updateUser(req: express.Request, res: express.Response) {
    console.log("user-rest updateUser: userName found in body = " + req.body.userName);
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((currentUser: IUserAttribute) => {
        if (currentUser.isSuperUser) {
          const user: IUserAttribute = {
            userName: req.body.userName,
            password: req.body.password,
            emailAddress: req.body.emailAddress,
            isSuperUser: req.body.isSuperUser,
          };
          if (!UserRest.isUserDataValidForUpdateBySuperUser(user)) {
            const error = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
          return UserLogic.updateUser(req.params.userId, user);
        }
        else {
          const regularUser: IUserAttribute = {
            userName: req.body.userName,
            password: req.body.password,
            emailAddress: req.body.emailAddress,
          };

          if (!UserRest.isUserDataValidForUpdate(regularUser)) {
            const error = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
          return UserLogic.updateUser(req.params.userId, regularUser);
        }
      })
      .then((updatedUser: IUserAttribute) => {
        RestResponse.send200(res, updatedUser);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static deleteUser(req: express.Request, res: express.Response) {
    console.log("user-rest deleteUser: entering");
    console.log("user-rest deleteUser: userId found in url = " + req.params.userId);
    UserLogic.deleteUser(req.params.userId)
      .then((success) => {
        console.log("user-rest deleteUser: successful delete for user id " + req.params.userId + " has occurred.");
        RestResponse.send200(res);
      })
      .catch((error) => {
        console.log("user-rest deleteUser: an error occurred while deleting user id  " + req.params.userId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveLeaguesForUser(req: express.Request, res: express.Response) {
    UserLogic.getLeaguesAsPlayer(req.params.userId)
      .then((leagues) => {
        RestResponse.send200(res, leagues);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveLeaguesAsAdmin(req: express.Request, res: express.Response) {
    console.log("user-rest getLeaguesAsAdminForUser:  Looking for legues that this user is an admin for  where UserId = " + req.params.userId);
    UserLogic.getLeaguesAsAdmin(req.params.userId)
      .then((leagues) => {
        RestResponse.send200(res, leagues);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  // Private Utility Functions

  private static ensureSuperUserOrSelf(req: express.Request, res: express.Response, next: express.NextFunction): void {
    // Get the user associated with the token
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
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

  private static isUserDataValidForUpdate(userData: IUserAttribute): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser === undefined;
    return result;
  }

  private static isUserDataValidForUpdateBySuperUser(userData: IUserAttribute): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser != null;
    return result;
  }
}

// Initialize static data
UserRest.init();
