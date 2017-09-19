
import * as Promise from 'bluebird';

// Logic Layer Classes
import {LeagueLogic} from './league-logic';
import {LogicError} from './logic-error';

// Model Layer Classes
import {ModelManager} from '../model/model-manager';
import {UserModelManager} from '../model/user-model-manager';
import {UserInstance} from '../model/user-model-manager';
import {UserAttribute} from '../model/user-model-manager';


export class UserLogic {

  static findUserById(id: number): Promise<UserInstance> {
    return UserLogic.findUser({ where: { "id": id } });
  }
  
  static findUserByAuthenticationToken(token: string): Promise<UserInstance> {
    return UserLogic.findUser({ where: { "authenticationToken": token } });
  }
  
  static findUserByUserName(userName: string): Promise<UserInstance> {
    return UserLogic.findUser({ where: { "userName": userName } })
  }
  
  static createUser(userData: UserAttribute): Promise<UserInstance> {
    console.log("user-logic.create() - createUser has been called.");
    // Ensure all of the required inputs are present
    if (!UserLogic.isNewUserValid(userData)) {
      return Promise.reject(UserLogic.buildIncompleteAttributesError());
    }
  
    // If we're here, we should be able to create a user, so...
    // Create the user
    return UserModelManager.userModel.create({
      userName: userData.userName,
      password: userData.password,
      emailAddress: userData.emailAddress,
      isSuperUser: false,
    })
      .then((createdUser: UserInstance) => {
        console.log("user-logic.create() " + userData.userName + " was successfully created.");
        return Promise.resolve(createdUser);
      })
      .catch(err => { return Promise.reject(UserLogic.buildCleanError(err)); })
  }
         
  static updateUser(userId: number, userData: UserAttribute): Promise<UserInstance> {
    console.log("user-logic.update() - updateUser has been called.");
  
    // If we're here, we should be able to update a user, so...
    // Update the user
    return UserModelManager.userModel.update(userData, { where: { id: userId } })
      .then(updatedUser => {
        console.log("user-logic.update() " + userData.userName + " was successfully updated.");
        return Promise.resolve(updatedUser);
      })
      .catch(err => { return Promise.reject(UserLogic.buildCleanError(err)); })
  }

  static deleteUser(userId: number): Promise<boolean> {
    console.log("user-logic.delete() - deleteUser has been called.");
  
    // If we're here, we should be able to delete a user, so...
    // Delete the user
    return UserModelManager.userModel.destroy({ where: { id: userId } })
      .then(numberUsersDeleted => {
        if (numberUsersDeleted === 1) {
          console.log("user-logic.delete() - User with ID of " + userId + " was successfully deleted.");
          return Promise.resolve(true);
        }  
        else {
          console.log("user-logic.delete() - User with ID of " + userId + " was not found.");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND)
        }
      })
      .catch(err => { 
        console.log("user-logic.delete() - Some type of error occurred.  Err message = " + err.message );
        return Promise.reject(UserLogic.buildCleanError(err)); 
      })
  }
    
  static getLeaguesAsPlayer(userId: number) {
    return UserLogic.findUserById(userId)
      .then(user => {
        return user.getPlayerLeague()
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }

  static getLeaguesAsAdmin(userId: number) {
    return UserLogic.findUserById(userId)
      .then(user => {
        return user.getAdminLeague()
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }

  static isLeagueAdmin(userId: number, leagueId: number): Promise<boolean> {
    return LeagueLogic.findLeagueById(leagueId)
      .then(league => {
        return league.hasAdmin(userId)
      })
      .catch(err => {
        Promise.reject(LogicError.firmUpError(err))
      })
  }


  // Private methods
  private static findUser(whereClause: any): Promise<UserInstance> {
    return UserModelManager.userModel.findOne(whereClause)
      .then(user => {
        if (user != null) {
          console.log("user-logic - user found!!!");
          return Promise.resolve(user)
        }
        else {
          console.log("user-logic - user was not found!!!");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch(err => {
        return Promise.reject(UserLogic.buildCleanError(err));
      })
  }
  
  private static isNewUserValid(userData: UserAttribute) {
    return (userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null)
  }
  
  private static buildIncompleteAttributesError() {
    console.log("user-logic - Building error indicating that all required attributes were not specified.")
    return new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.")
  }
  
  private static buildCleanError(err: any): LogicError {
    var cleanError;
    // Try to clean up expected errors.  
    // We could see the SequelizeUniqueConstraintError when someone tries to create a new user
    // or update an existing user and the desired username is already in existence
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log("user-logic - Building error indicating that user already exists.")
      cleanError = new LogicError(LogicError.DUPLICATE.name, "The requested user name already exists.");
    }
    else {
      console.log("user-logic - Cleaning up an unexpected error.")
      cleanError = LogicError.firmUpError(err);
    }
    return cleanError;
  }

}

