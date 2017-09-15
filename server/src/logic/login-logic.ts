
var MathUtils = require('../common/math-util');
var DateUtils = require('../common/date-util');
import {UserLogic} from './user-logic';
import {LogicError} from './logic-error';


export class LoginCredentials {
  private readonly _userName: string;
  private readonly _password: string;

  constructor(userName: string, password: string) {
    this._userName = userName;
    this._password = password;
  }

  get userName() : string {
    return this._userName;  
  }
  get password() : string {
    return this._password;  
  }
}


export class LoginLogic {

  static login(loginCredentials: LoginCredentials): Promise<any> {

    var guid = MathUtils.createGuid();
    // This is the only error message that we will provide in the 
    // event that we're being hacked.
    var errorMessage = "Login Credentials were not correct.";
    var foundUser;

    return UserLogic.findUserByUserName(loginCredentials.userName)
      .then(user => {
        if (user != null && user.password === loginCredentials.password) {
          foundUser = user;
          // Only update the 
          return UserLogic.updateUser(user.id,
            {
              authenticationToken: guid,
              authenticationTokenExpiration: DateUtils.createAuthenticationExpirationDate()
            });
        }
        else {
          return Promise.reject(LogicError.LOGIN_FAILED);
        }
      })

      .then(junk => { return Promise.resolve({ "user": foundUser, "wolfeAuthenticationToken": guid }); })

      .catch(err => {
        console.log("login-logic.login() - Landed in generic catch - Login Failed");
        // If any error occurred, just indicate that the login failed to the caller.
        return Promise.reject(LogicError.LOGIN_FAILED);
      })

  }

  static logout (userName: string): Promise<any> {
    return UserLogic.findUserByUserName(userName)
      .then(user => {
        return UserLogic.updateUser(user.id, { authenticationTokenExpiration: new Date() });
      })
      .then(junk => {
        return Promise.resolve(null);
      })
      .catch(err => {
        // If an error occurred, get it into a proper format and log it
        var logicError = LogicError.firmUpError(err);
        console.log("login-logic.logout() - " + logicError.message);
        // If any error occurred, just indicate that the logout unexpectedly failed 
        return Promise.reject(logicError);
      })
  }

}