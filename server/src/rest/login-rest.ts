// Rest Layer Classes
import {RestResponse} from './rest-response';

// Logic Layer Classes
import {LoginLogic} from '../logic/login-logic';
import {LoginCredentials} from '../logic/login-logic';
import {UserLogic} from '../logic/user-logic';

// Model Layer Classes
import {IUser} from '../model/user';
import {IUserInstance, UserModelManager} from '../model/user-model-manager';

// Javascript packages
import * as express from 'express';

export class LoginRest {
  private static router: express.Router = express.Router();

  public static getRouter(): express.Router {
    return LoginRest.router;
  }

  public static init(): void {
    LoginRest.router.post('/login', LoginRest.login);
    LoginRest.router.post('/logout', LoginRest.logout);
  }

  // Login
  private static login(req: express.Request, res: express.Response): any {
    console.log("login-rest login: username found in body = " + req.body.userName);
    console.log("login-rest login: password found in body = " + req.body.password);
    LoginLogic.login(new LoginCredentials(req.body.userName, req.body.password))
      .then(([loggedInUser, wolfeAuthenticationToken]: [IUserInstance, string]) => {
        // Transform the IUserInstance to an IUser (our form that users of our RESTful service should be using)
        const returnUser: IUser = UserModelManager.createIUserFromAnything(loggedInUser);
        RestResponse.send200WithHeader(res, "Wolfe-Authentication-Token", wolfeAuthenticationToken, returnUser);
      })
      // Anytime login fails, we send back the same thing (not trying to provide too much info)
      .catch((errorMessage) => {
        RestResponse.send401(res, "User Name and password do not match.");
      });
  }

  // Logout
  private static logout(req: express.Request, res: express.Response): any {
    console.log("login-rest logout requested: ");
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then((user) => {
      return LoginLogic.logout(user.userName);
    })
    .then( (junk) => {
      RestResponse.send200(res);
    })
    .catch( (error) => {
      RestResponse.sendAppropriateResponse(res, error);
    });
  }
}

// Initialize static data
LoginRest.init();
