
// Logic level classes
import {LogicError} from './logic-error';
import {UserLogic} from './user-logic';

// Model level classes
import {IUser} from '../model/user';
import { IUserInstance, UserModelManager } from '../model/user-model-manager';

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

  public static login(loginCredentials: LoginCredentials): Promise<[IUserInstance, string]> {

    const guid: string = MathUtil.createGuid();
    // This is the only error message that we will provide in the
    // event that we're being hacked.
    let foundUser: IUserInstance;

    return UserLogic.instanceOf().findUserByUserName(loginCredentials.userName)
      .then((user: IUserInstance) => {
        if (user != null && user.password === loginCredentials.password) {
          foundUser = user;
          // Only update the authentication token and its expiration date
          return UserLogic.instanceOf().update(
            {
              id: user.id,
              authenticationToken: guid,
              authenticationTokenExpiration: DateUtil.createAuthenticationExpirationDate(),
            });
        }
        else {
          return Promise.reject(LogicError.LOGIN_FAILED);
        }
      })

      .then((success) => {
        return Promise.resolve([foundUser, guid]);
      })

      .catch((err) => {
        console.log("login-logic.login() - Landed in generic catch - Login Failed");
        // If any error occurred, just indicate that the login failed to the caller.
        return Promise.reject(LogicError.LOGIN_FAILED);
      });

  }

  public static logout(userName: string): Promise<void> {
    return UserLogic.instanceOf().findUserByUserName(userName)
      .then((user) => {
        return UserLogic.instanceOf().update({ authenticationTokenExpiration: new Date() });
      })
      .then( (success) => {
        return Promise.resolve();
      })
      .catch((err) => {
        // If an error occurred, get it into a proper format and log it
        const logicError: LogicError = LogicError.firmUpError(err);
        console.log("login-logic.logout() - " + logicError.message);
        // If any error occurred, just indicate that the logout unexpectedly failed
        return Promise.reject(logicError);
      });
  }

}
