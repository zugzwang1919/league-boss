
import * as Promise from 'bluebird';

// Logic Layer Classes
import {LeagueLogic} from './league-logic';
import {LogicError} from './logic-error';

// Model Layer Classes
import {ILeagueAttribute} from '../model/league-model-manager';
import {ModelManager} from '../model/model-manager';
import {IUser} from '../model/user';
import {UserModelManager} from '../model/user-model-manager';
import {IUserInstance} from '../model/user-model-manager';
import {IUserAttribute} from '../model/user-model-manager';

export class UserLogic {

  public static findUserById(userId: number): Promise<IUserInstance> {
    return UserLogic.findUser({ where: { id: userId } });
  }

  public static findUserByAuthenticationToken(token: string): Promise<IUserInstance> {
    return UserLogic.findUser({ where: { authenticationToken: token } });
  }

  public static findUserByUserName(uName: string): Promise<IUserInstance> {
    return UserLogic.findUser({ where: { userName: uName } });
  }

  public static createUser(userData: IUser): Promise<IUserInstance> {
    console.log("user-logic.create() - createUser has been called.");
    // Ensure all of the required inputs are present
    if (!UserLogic.isNewUserValid(userData)) {
      return Promise.reject(UserLogic.buildIncompleteAttributesError());
    }
    // If we're here, we should be able to create a user, so...
    // Create the user
    return UserModelManager.userModel.create(userData)
      .then((createdUser: IUserInstance) => {
        console.log("user-logic.create() " + userData.userName + " was successfully created.");
        return Promise.resolve(createdUser);
      })
      .catch((err) => Promise.reject(UserLogic.buildCleanError(err)));
  }

  public static updateUser(userId: number, userData: IUserAttribute): Promise<boolean> {
    console.log("user-logic.update() - updateUser has been called.");
    // NOTE:  We do allow the partial update of a user (i.e. I just want to update the token expiration field, etc)
    // so there is no checking here for a "fully-formed" user
    // This makes me a little uncomfortable given its difference from other model types; therefore, making a case for
    // breaking the token stuff out into its own object
    return UserModelManager.userModel.update(userData, { where: { id: userId } })
      .then((success) => {
        console.log("user-logic.update() - User ID " + userId + " was successfully updated.");
        return Promise.resolve(true);
      })
      .catch((err) => Promise.reject(UserLogic.buildCleanError(err)));
  }

  public static deleteUser(userId: number): Promise<boolean> {
    console.log("user-logic.delete() - deleteUser has been called.");
    return UserModelManager.userModel.destroy({ where: { id: userId } })
      .then((numberUsersDeleted) => {
        if (numberUsersDeleted === 1) {
          console.log("user-logic.delete() - User with ID of " + userId + " was successfully deleted.");
          return Promise.resolve(true);
        }
        else {
          console.log("user-logic.delete() - User with ID of " + userId + " was not found.");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        console.log("user-logic.delete() - Some type of error occurred.  Err message = " + err.message );
        return Promise.reject(UserLogic.buildCleanError(err));
      });
  }

  public static getLeaguesAsPlayer(userId: number): Promise<ILeagueAttribute[]> {
    return UserLogic.findUserById(userId)
      .then((user) => {
        return user.getPlayerLeagues();
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static getLeaguesAsAdmin(userId: number): Promise<ILeagueAttribute[]> {
    return UserLogic.findUserById(userId)
      .then((user) => {
        return user.getAdminLeagues();
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static isLeagueAdmin(userId: number, leagueId: number): Promise<boolean> {
    return LeagueLogic.findLeagueById(leagueId)
      .then((league) => {
        return league.hasAdmin(userId);
      })
      .catch((err) => {
        Promise.reject(LogicError.firmUpError(err));
      });
  }

  // Private methods
  private static findUser(whereClause: any): Promise<IUserInstance> {
    return UserModelManager.userModel.findOne(whereClause)
      .then((user) => {
        if (user != null) {
          console.log("user-logic - user found!!!");
          return Promise.resolve(user);
        }
        else {
          console.log("user-logic - user was not found!!!");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        return Promise.reject(UserLogic.buildCleanError(err));
      });
  }

  private static isNewUserValid(userData: IUserAttribute): boolean {
    return (userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null);
  }

  private static buildIncompleteAttributesError(): LogicError {
    console.log("user-logic - Building error indicating that all required attributes were not specified.");
    return new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.");
  }

  private static buildCleanError(err: any): LogicError {
    let cleanError: LogicError;
    // Try to clean up expected errors.
    // We could see the SequelizeUniqueConstraintError when someone tries to create a new user
    // or update an existing user and the desired username is already in existence
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log("user-logic - Building error indicating that user already exists.");
      cleanError = new LogicError(LogicError.DUPLICATE.name, "The requested user name already exists.");
    }
    else {
      console.log("user-logic - Cleaning up an unexpected error.");
      cleanError = LogicError.firmUpError(err);
    }
    return cleanError;
  }

}
