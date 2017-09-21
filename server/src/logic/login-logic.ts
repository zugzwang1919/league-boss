
// Logic level classes
import {LogicError} from './logic-error';
import {UserLogic} from './user-logic';

// Model level classes
import {IUserAttribute} from '../model/user-model-manager';

// Common classes
import {DateUtil} from '../common/date-util';
import {MathUtil} from '../common/math-util';

import * as Promise from 'bluebird';

export class LoginCredentials {
  private readonly _userName: string;
  private readonly _password: string;

  constructor(userName: string, password: string) {
    this._userName = userName;
    this._password = password;
  }

  get userName(): string {
    return this._userName;
  }
  get password(): string {
    return this._password;
  }
}

export class LoginLogic {

  public static login(loginCredentials: LoginCredentials): Promise<any> {

    const guid: string = MathUtil.createGuid();
    // This is the only error message that we will provide in the
    // event that we're being hacked.
    let foundUser: IUserAttribute;

    return UserLogic.findUserByUserName(loginCredentials.userName)
      .then((user: IUserAttribute) => {
        if (user != null && user.password === loginCredentials.password) {
          foundUser = user;
          // Only update the authentication token and its expiration date
          return UserLogic.updateUser(user.id,
            {
              authenticationToken: guid,
              authenticationTokenExpiration: DateUtil.createAuthenticationExpirationDate(),
            });
        }
        else {
          return Promise.reject(LogicError.LOGIN_FAILED);
        }
      })

      .then((updatedUser: IUserAttribute) => Promise.resolve({ user: foundUser, wolfeAuthenticationToken: guid }))

      .catch((err) => {
        console.log("login-logic.login() - Landed in generic catch - Login Failed");
        // If any error occurred, just indicate that the login failed to the caller.
        return Promise.reject(LogicError.LOGIN_FAILED);
      });

  }

  public static logout(userName: string): Promise<void> {
    return UserLogic.findUserByUserName(userName)
      .then((user) => {
        return UserLogic.updateUser(user.id, { authenticationTokenExpiration: new Date() });
      })
      .then( (updatedUser: IUserAttribute) => {
        return Promise.resolve();
      })
      .catch((err) => {
        // If an error occurred, get it into a proper format and log it
        const logicError = LogicError.firmUpError(err);
        console.log("login-logic.logout() - " + logicError.message);
        // If any error occurred, just indicate that the logout unexpectedly failed
        return Promise.reject(logicError);
      });
  }

}
