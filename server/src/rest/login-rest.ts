// Rest Layer Classes
import {RestResponse} from './rest-response';

//Logic Layer Classes
import {UserLogic} from '../logic/user-logic';
import {LoginLogic} from '../logic/login-logic';
import {LoginCredentials} from '../logic/login-logic';

import * as express from  'express';


export class LoginRest {
  private static router: express.Router = express.Router();  

  static getRouter(): express.Router {
    return LoginRest.router;
  }

  static init() {
    LoginRest.router.post('/login', LoginRest.login);
    LoginRest.router.post('/logout', LoginRest.logout);
  }

  // Login
  private static login(req: express.Request, res: express.Response) {
    console.log("login-rest login: username found in body = " + req.body.userName);
    console.log("login-rest login: password found in body = " + req.body.password);
    LoginLogic.login(new LoginCredentials(req.body.userName, req.body.password))
      .then(data => {
        RestResponse.send200WithHeader(res, "Wolfe-Authentication-Token", data.wolfeAuthenticationToken, {"message": "Success!!!", "user": data.user})
      })
      // Anytime login fails, we send back the same thing (not trying to provide too much info)
      .catch(errorMessage => { RestResponse.send401(res, "User Name and password do not match.") });
  }

  // Logout
  private static logout(req: express.Request, res: express.Response) {
    console.log("login-rest logout requested: ");
    UserLogic.findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
    .then(user => {
      return LoginLogic.logout(user.userName)
    })
    .then( junk => {
      RestResponse.send200(res, undefined);
    })
    .catch( error => {
      RestResponse.sendAppropriateResponse(res, error)
    })
  }
}

// Initialize static data
LoginRest.init();