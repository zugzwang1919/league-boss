// Logic level classes
import {LogicError} from './logic-error';
import {LogicUtil} from './logic-util';
import {UserLogic} from './user-logic';

// Model level classes
import {LeagueModelManager} from '../model/league-model-manager';
import {ILeagueInstance} from '../model/league-model-manager';
import {ILeagueAttribute} from '../model/league-model-manager';
import {IUserAttribute, IUserInstance} from '../model/user-model-manager';

import * as Promise from 'bluebird';

export class LeagueLogic {

  public static findLeagueById(leagueId: number): Promise<ILeagueInstance> {
    return LogicUtil.instanceOf().findById(LeagueModelManager.leagueModel, leagueId, "league");
  }

  public static createLeague(leagueData: ILeagueAttribute, creatingUserId: number): Promise<ILeagueInstance> {
    console.log("league-logic.create() - createLeague has been called.");
    // Ensure all of the required inputs are present
    if (!LeagueLogic.isNewLeagueValid(leagueData)) {
      return Promise.reject(LeagueLogic.buildIncompleteAttributesError());
    }

    let leagueToReturn: ILeagueInstance;

    // If we're here, we should be able to create a league, so...
    // Create the league
    return LeagueModelManager.leagueModel.create(leagueData)

      .then((league: ILeagueInstance) => {
        console.log("league-logic.create() " + leagueData.leagueName + " was successfully created.");
        console.log("league-logic.create() - Preparing to add admin");
        leagueToReturn = league;
        return league.addAdmin(creatingUserId);
      })
      .then((stuff: any) => {
        return Promise.resolve(leagueToReturn);
      })
      .catch((err: any) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static updateLeague(leagueData: ILeagueAttribute): Promise<boolean> {
    console.log("league-logic.update() - updateLeague has been called.");

    // Ensure all of the required inputs are present
    if (!LeagueLogic.isExistingLeagueValid(leagueData)) {
      return Promise.reject(LeagueLogic.buildIncompleteAttributesError());
    }

    // If we're here, we should be able to update a league, so...
    // Update the league
    return LeagueModelManager.leagueModel.update(leagueData, { where: { id: leagueData.id } })
      .then((thing: [number, ILeagueInstance[]]) => {
        console.log("league-logic.update() " + leagueData.leagueName + " was successfully updated.");
        // const updatedLeague: ILeagueInstance = thing as ILeagueInstance;
        return Promise.resolve(true);
      })
      .catch((err) => Promise.reject(LogicError.firmUpError(err)));
  }

  public static deleteLeague(leagueId: number): Promise<boolean> {
    return LogicUtil.instanceOf().deleteById(LeagueModelManager.leagueModel, leagueId, "league");
  }

  public static getAdmins(leagueId: number): Promise<IUserAttribute[]> {
    return this.findLeagueById(leagueId)
      .then((league: ILeagueInstance) => {
        return league.getAdmins();
      })
      .catch((err) => Promise.reject(LogicError.firmUpError(err)));
  }

  public static addAdmin(leagueId: number, userId: number): Promise<boolean> {
    let foundLeague: ILeagueInstance;
    return UserLogic.findUserById(userId)
      .then((user: IUserInstance) => {
        return this.findLeagueById(leagueId);
      })
      .then((league: ILeagueInstance) => {
        foundLeague = league;
        return foundLeague.hasAdmin(userId);
      })
      .then((leagueAlreadyHasAdmin: boolean) => {
        if (leagueAlreadyHasAdmin) {
          return Promise.reject(LogicError.DUPLICATE);
        }
        else {
          return foundLeague.addAdmin(userId);
        }
      })
      .then((newLeagueAdmin) => {
        return Promise.resolve(true);
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static removeAdmin(leagueId: number, userId: number): Promise<boolean> {
    return this.findLeagueById(leagueId)
      .then((league: ILeagueInstance) => {
        return league.removeAdmin(userId);
      })
      .then((numberDeleted: number) => {
        if (numberDeleted > 0) {
          return Promise.resolve(true);
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static getPlayers(leagueId: number): Promise<IUserAttribute[]> {
    return this.findLeagueById(leagueId)
      .then((league: ILeagueInstance) => {
        return league.getPlayers();
      })
      .catch((err) => Promise.reject(LogicError.firmUpError(err)));
  }

  public static addPlayer(leagueId: number, userId: number): Promise<boolean> {
    let foundLeague: ILeagueInstance;
    return UserLogic.findUserById(userId)
      .then((user: IUserInstance) => {
        return this.findLeagueById(leagueId);
      })
      .then((league: ILeagueInstance) => {
        foundLeague = league;
        return foundLeague.hasPlayer(userId);
      })
      .then((playerAlreadyInLeague: boolean) => {
        if (playerAlreadyInLeague) {
          return Promise.reject(LogicError.DUPLICATE);
        }
        else {
          return foundLeague.addPlayer(userId);
        }
      })
      .then((wasPlayerAddedToLeague: boolean) => {
        return Promise.resolve(true);
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static removePlayer(leagueId: number, userId: number): Promise<boolean> {
    return this.findLeagueById(leagueId)
      .then((league: ILeagueInstance) => {
        return league.removePlayer(userId);
      })
      .then((numberDeleted: number) => {
        if (numberDeleted > 0) {
          return Promise.resolve(true);
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

// Private functions

  private static isNewLeagueValid(leagueData: ILeagueAttribute): boolean {
    return (leagueData.leagueName != null &&
      leagueData.description != null &&
      leagueData.leagueTypeIndex != null &&
      leagueData.seasonTypeIndex != null);
  }

  private static isExistingLeagueValid(leagueData: ILeagueAttribute): boolean {
    return (leagueData.id != null &&
      leagueData.leagueName != null &&
      leagueData.description != null &&
      leagueData.leagueTypeIndex != null &&
      leagueData.seasonTypeIndex != null);
  }

  private static buildIncompleteAttributesError(): LogicError {
    console.log("league-logic - Building error indicating that all required attributes were not specified.");
    return new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required league attributes is missing.");
  }

}
