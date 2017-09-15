var DataModel = require('../model/dataModel');
var League = DataModel.LEAGUE;

// Logic level classes
import {UserLogic} from './user-logic';
import {LogicError} from './logic-error';


export class LeagueLogic {

  static findLeagueById(id: number) {
    return LeagueLogic.findLeague({ where: { "id": id } });
  }
  
  static createLeague(leagueData, creatingUserId) {
    console.log("league-logic.create() - createLeague has been called.");
    // Ensure all of the required inputs are present
    if (!LeagueLogic.isNewLeagueValid(leagueData)) {
      return Promise.reject(LeagueLogic.buildIncompleteAttributesError());
    }
  
    var leagueToReturn;
  
    // If we're here, we should be able to create a league, so...
    // Create the league
    return League.create({
      leagueName: leagueData.leagueName,
      description: leagueData.description,
      seasonTypeIndex: leagueData.seasonTypeIndex,
      leagueTypeIndex: leagueData.leagueTypeIndex
    })
  
      .then(league => {
        console.log("league-logic.create() " + leagueData.leagueName + " was successfully created.");
        console.log("league-logic.create() - Preparing to add admin");
        leagueToReturn = league;
        return league.addAdmin(creatingUserId.userId)
      })
      .then(stuff => {
        return Promise.resolve(leagueToReturn)
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }

  static updateLeague(leagueData) {
    console.log("league-logic.update() - updateLeague has been called.");
  
    // Ensure all of the required inputs are present
    if (!LeagueLogic.isExistingLeagueValid(leagueData)) {
      return Promise.reject(LeagueLogic.buildIncompleteAttributesError());
    }
  
    // If we're here, we should be able to update a league, so...
    // Update the league
    return League.update({
      leagueName: leagueData.leagueName,
      description: leagueData.description,
      seasonTypeIndex: leagueData.seasonTypeIndex,
      leagueTypeIndex: leagueData.leagueTypeIndex
    },
      { where: { id: leagueData.id } }
    )
      .then(result => {
        console.log("league-logic.update() " + leagueData.leagueName + " was successfully updated.");
        return Promise.resolve(null);
      })
      .catch(err => { return Promise.reject(LogicError.firmUpError(err)); })
  }
  
  static deleteLeague(leagueId: number) {
    console.log("league-logic.delete() - deleteLeague has been called.");
    return League.destroy({ where: { id: leagueId } })
      .then(numberLeaguesDeleted => {
        if (numberLeaguesDeleted === 1) {
          console.log("league-logic.delete() - League with ID of " + leagueId + " was successfully deleted.");
          return Promise.resolve(true);
        }  
        else {
          console.log("league-logic.delete() - League with ID of " + leagueId + " was not found.");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND)
        }
      })
      .catch(err => { 
        console.log("league-logic.delete() - Some type of error occurred.  Err message = " + err.message );
        return Promise.reject(LogicError.firmUpError(err));
      })
  }
  
  static getAdmins(leagueId: number) {
    return this.findLeagueById(leagueId)
      .then(league => {
        return league.getAdmin()
      })
      .catch(err => { return Promise.reject(LogicError.firmUpError(err)); })
  }
  
  static addAdmin(leagueId: number, userId: number) {
    var foundLeague;
    return UserLogic.findUserById(userId)
      .then(user => {
        return this.findLeagueById(leagueId)
      })
      .then(league => {
        foundLeague = league;
        return foundLeague.hasAdmin(userId)
      })
      .then(leagueAlreadyHasAdmin => {
        if (leagueAlreadyHasAdmin)
          return Promise.reject(LogicError.DUPLICATE);
        else
          return foundLeague.addAdmin(userId);
      })
      .then(newLeagueAdmin => {
        return true;
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }
  
  static removeAdmin(leagueId: number, userId: number) {
    return this.findLeagueById(leagueId)
      .then(league => {
        return league.removeAdmin(userId)
      })
      .then(numAdminsRemoved => {
        if (numAdminsRemoved === 1) {
          return true;
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }
  
  static getPlayers(leagueId: number) {
    return this.findLeagueById(leagueId)
      .then(league => {
        return league.getPlayer()
      })
      .catch(err => { return Promise.reject(LogicError.firmUpError(err)); })
  }
  
  static addPlayer(leagueId: number, userId: number) {
    var foundLeague;
    return UserLogic.findUserById(userId)
      .then(user => {
        return this.findLeagueById(leagueId)
      })
      .then(league => {
        foundLeague = league;
        return foundLeague.hasPlayer(userId)
      })
      .then(playerAlreadyInLeague => {
        if (playerAlreadyInLeague)
          return Promise.reject(LogicError.DUPLICATE);
        else
          return foundLeague.addPlayer(userId);
      })
      .then(wasPlayerAddedToLeague => {
        return true;
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }
  
  static removePlayer(leagueId: number, userId:number) {
    return this.findLeagueById(leagueId)
      .then(league => {
        return league.removePlayer(userId)
      })
      .then(numPlayersRemoved => {
        if (numPlayersRemoved === 1) {
          return true;
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }


// Private functions
  

  private static findLeague(whereClause) {
    return League.findOne(whereClause)
      .then(league => {
        if (league != null) {
          console.log("league-logic - league found!!!");
          return Promise.resolve(league)
        }
        else {
          console.log("league-logic - league was not found!!!");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }
          
  private static isNewLeagueValid(leagueData): boolean {
    return (leagueData.leagueName != null &&
      leagueData.description != null)
  }

  private static isExistingLeagueValid(leagueData): boolean {
    return (leagueData.id != null &&
      leagueData.leagueName != null &&
      leagueData.description != null)
  }
  
  private static buildIncompleteAttributesError() {
    console.log("league-logic - Building error indicating that all required attributes were not specified.")
    return new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required league attributes is missing.")
  }

  
}













