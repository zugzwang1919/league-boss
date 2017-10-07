
import * as Promise from 'bluebird';

// Logic Layer Classes
import {LeagueLogic} from './league-logic';
import {Logic} from './logic';
import {LogicError} from './logic-error';

// Model Layer Classes
import {ILeagueAttribute} from '../model/league-model-manager';
import {ModelManager} from '../model/model-manager';
import {IUser} from '../model/user';
import {UserModelManager} from '../model/user-model-manager';
import {IUserInstance} from '../model/user-model-manager';
import {IUserAttribute} from '../model/user-model-manager';

export class UserLogic extends Logic<IUserInstance> {
  private static theInstance: UserLogic;

  public static instanceOf(): UserLogic {
    if (!UserLogic.theInstance) {
      UserLogic.theInstance = new UserLogic();
    }
    return UserLogic.theInstance;
  }

  constructor() {
    super(UserModelManager.userModel);
  }

  public findUserByAuthenticationToken(token: string): Promise<IUserInstance> {
    return this.findOneBasedOnWhereClause({ authenticationToken: token });
  }

  public findUserByUserName(uName: string): Promise<IUserInstance> {
    return this.findOneBasedOnWhereClause({ userName: uName });
  }

  public create(userData: IUser): Promise<IUserInstance> {
    console.log("  user-logic.create() - createUser has been called.");
    // Ensure all of the required inputs are present
    if (!UserLogic.isNewUserValid(userData)) {
      return Promise.reject(UserLogic.buildIncompleteAttributesError());
    }
    return super.create(userData)
    // Normally, if the "common" logic code throws an error we're happy to let it flow back to the rest layer.
    // In this instance, if the call above throws an error, we'll actually catch it and try to clean it up
    // since a user could try to select a username that is already in use.
      .catch((err) => {
        return Promise.reject(UserLogic.buildCleanError(err));
      });
  }

  public update(userData: any): Promise<boolean> {
    console.log("  user-logic.update() - updateUser has been called.");
    return super.update(userData)
    // Normally, if the "common" logic code throws an error we're happy to let it flow back to the rest layer.
    // In this instance, if the call above throws an error, we'll actually catch it and try to clean it up
    // since a user could try to select a username that is already in use.
      .catch((err) => {
        return Promise.reject(UserLogic.buildCleanError(err));
      });
  }

  public getLeaguesAsPlayer(userId: number): Promise<ILeagueAttribute[]> {
    return this.findById(userId)
      .then((user) => {
        return user.getPlayerLeagues();
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public getLeaguesAsAdmin(userId: number): Promise<ILeagueAttribute[]> {
    return this.findById(userId)
      .then((user) => {
        return user.getAdminLeagues();
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public isLeagueAdmin(userId: number, leagueId: number): Promise<boolean> {
    return LeagueLogic.instanceOf().findById(leagueId)
      .then((league) => {
        return league.hasAdmin(userId);
      })
      .catch((err) => {
        Promise.reject(LogicError.firmUpError(err));
      });
  }

  // Private methods
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
