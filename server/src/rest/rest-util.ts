import * as express from  'express';

// Rest Layer Classes
import {RestResponse} from './rest-response';

// Logic Layer Classes
import {UserLogic} from '../logic/user-logic';

// Model Layer Classes
import {UserInstance} from '../model/user-model-manager';

// Common Classes
import {DateUtil} from '../common/date-util';


export class RestUtil {

  static ensureAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
    var token = req.header('Wolfe-Authentication-Token');
    if (token) {
      UserLogic.findUserByAuthenticationToken(token)
        // User found
        .then((user: UserInstance) => {
          // If the session hasn't timed out...
          if (user.authenticationTokenExpiration.valueOf() > Date.now()) {
            // Bump the expiration date
            return UserLogic.updateUser(user.id, { authenticationTokenExpiration: DateUtil.createAuthenticationExpirationDate() });
          }
          // Session timed out
          else {
            return Promise.reject({ "name": "SESSION_TIMEOUT", "message": "Session timed out." });
          }
        })
        // Update went OK
        .then(user => {
          res.header('Wolfe-Authentication-Token', token);
          next();
        })
        // Something went wrong
        .catch(err => {
          console.log("err.name = " + err.name);
          console.log("err.message = " + err.message);
          RestResponse.send401(res);
        });
    }
    else {
      RestResponse.send401(res);
    }
  }


  static ensureSuperUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    // Get the user associated with the token
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then(foundUser => {
        // If this is a superuser, we're good to go (call next())
        if (foundUser.isSuperUser) {
          next();
        }
        // Otherwise, reject the request
        else {
          return Promise.reject({ "name": "NOT_SUPER_USER", "message": "The current user is not a super user." });
        }
      })
      .catch(error => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      })
  }

}