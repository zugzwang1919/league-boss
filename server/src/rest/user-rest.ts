
// Rest Classes
import {RestUtil}  from './rest-util';
import {RestResponse}  from './rest-response';

// Logic Classes
import {UserLogic} from '../logic/user-logic';
import {UserLeagueLogic} from '../logic/user-league-logic';
import {LogicError} from '../logic/logic-error';

import * as express from  'express';


export class UserRest {
  private static router: express.Router = express.Router();

  static getRouter(): express.Router {
    return UserRest.router;
  }

  static init() {
    UserRest.router.get('/:userId',RestUtil.ensureAuthenticated, UserRest.retrieveUserById);
    UserRest.router.get('/', RestUtil.ensureAuthenticated, UserRest.retrieveUser);
    UserRest.router.post('/', UserRest.createUser);
    UserRest.router.put('/:userId', RestUtil.ensureAuthenticated, UserRest.ensureSuperUserOrSelf, UserRest.updateUser);
    UserRest.router.delete('/:userId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, UserRest.deleteUser);
    UserRest.router.get('/:userId/leagueAsPlayer', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesForUser);
    UserRest.router.get('/:userId/leagueAsAdmin', RestUtil.ensureAuthenticated, UserRest.retrieveLeaguesAsAdmin);
  }

  private static retrieveUserById (req, res) {
    console.log("user-rest getUser:  Looking for user with an id of " + req.params.userId);
    UserLogic.findUserById(req.params.userId)
      .then(user => { 
        RestResponse.send200(res, user) 
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error) 
      })
  }

  private static retrieveUser (req, res) {
    console.log("user-rest getUser:  Looking for user with a name of " + req.query.userName);
    UserLogic.findUserByUserName(req.query.userName)
      .then(user => {
        RestResponse.send200(res, user)
      })
      .catch(error => {
        RestResponse.sendAppropriateResponse(res, error)
      });
  }

  private static createUser(req, res) {
    console.log("user-rest createUser: userName found in body = " + req.body.userName);
    UserLogic.createUser({
      userName: req.body.userName,
      password: req.body.password,
      emailAddress: req.body.emailAddress,
      isSuperUser: false
    })
      .then(createdUser => {
        RestResponse.send200(res, createdUser)
      })
      .catch(error => {
        RestResponse.sendAppropriateResponse(res, error)
      });
  }

  private static updateUser(req, res) {
    console.log("user-rest updateUser: userName found in body = " + req.body.userName);
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then(currentUser => {
        if (currentUser.isSuperUser) {
          var superUserData =
            {
              userName: req.body.userName,
              password: req.body.password,
              emailAddress: req.body.emailAddress,
              isSuperUser: req.body.isSuperUser,
            };
          if (!UserRest.isUserDataValidForUpdateBySuperUser(superUserData)) {
            const error = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
          return UserLogic.updateUser(req.params.userId, superUserData);
        }
        else {
          var userData =
            {
              userName: req.body.userName,
              password: req.body.password,
              emailAddress: req.body.emailAddress,
            };
  
          if (!UserRest.isUserDataValidForUpdate(userData)) {
            const error = new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
            return Promise.reject(error);
          }
          return UserLogic.updateUser(req.params.userId, userData);
        }
      })
      .then(user => { 
        RestResponse.send200(res, user); 
      })
      .catch(error => { 
        RestResponse.sendAppropriateResponse(res, error); 
      });
  }

  private static deleteUser(req, res) {
    console.log("user-rest deleteUser: entering");
    console.log("user-rest deleteUser: userId found in url = " + req.params.userId);
    UserLogic.deleteUser(req.params.userId)
      .then(success => {
        console.log("user-rest deleteUser: successful delete for user id " + req.params.userId + " has occurred.");
        RestResponse.send200(res, undefined);
      })
      .catch(error => {
        console.log("user-rest deleteUser: an error occurred while deleting user id  " + req.params.userId);
        RestResponse.sendAppropriateResponse(res, error);
      })  
  }

  private static retrieveLeaguesForUser(req, res) {
    UserLeagueLogic.getLeaguesAsPlayer(req.params.userId)
      .then(leagues => {
        RestResponse.send200(res, leagues)
      })
      .catch(error => {
        RestResponse.sendAppropriateResponse(res, error)
      })
  }

  private static retrieveLeaguesAsAdmin(req, res) {
    console.log("user-rest getLeaguesAsAdminForUser:  Looking for legues that this user is an admin for  where UserId = " + req.params.userId);
    UserLeagueLogic.getLeaguesAsAdmin(req.params.userId)
      .then(leagues => {
        RestResponse.send200(res, leagues)
      })
      .catch(error => {
        RestResponse.sendAppropriateResponse(res, error)
      })
  }

  
  // Private Utility Functions

  private static ensureSuperUserOrSelf(req, res, next): void {
    // Get the user associated with the token
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then(foundUser => {
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
            return Promise.reject({ "name": "NOT_SELF", "message": "User is not self." });
          }
        }
      })
      .catch(error => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      })
  }

  private static isUserDataValidForUpdate(userData): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser === undefined;
    return result;
  }

  private static isUserDataValidForUpdateBySuperUser(userData): boolean {
    const result: boolean = userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null &&
      userData.isSuperUser != null;
    return result;
  }
}

// Initialize static data
UserRest.init();
