// Logic level classes
import {LogicError} from './logic-error';
import {UserLogic} from './user-logic';

// Model level classes
import {ISeasonAttribute, ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';

import * as Promise from 'bluebird';

export class SeasonLogic {

  public static findSeasonById(seasonId: number): Promise<ISeasonInstance> {
    console.log("season-logic.findById() - findSeasonById has been called.");
    return SeasonModelManager.seasonModel.findById(seasonId);
  }

  public static findAllSeasons(): Promise<ISeasonInstance[]> {
    console.log("season-logic.findAllSeasons() - findAllSeasons has been called.");
    return SeasonModelManager.seasonModel.findAll();
  }

  public static createSeason(seasonData: ISeasonAttribute): Promise<ISeasonInstance> {
    console.log("season-logic.create() - createSeason has been called.");
    // Ensure all of the required inputs are present
    if (!SeasonLogic.isNewSeasonValid(seasonData)) {
      return Promise.reject(SeasonLogic.buildIncompleteAttributesError());
    }

    // Create the season
    return SeasonModelManager.seasonModel.create(seasonData)

      .then((season: ISeasonInstance) => {
        console.log("season-logic.create() " + seasonData.seasonName + " was successfully created.");
        return Promise.resolve(season);
      })
      .catch((err: any) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static updateSeason(seasonData: ISeasonAttribute): Promise<boolean> {
    console.log("season-logic.update() - updateSeason has been called.");

    // Ensure all of the required inputs are present
    if (!SeasonLogic.isExistingSeasonValid(seasonData)) {
      return Promise.reject(SeasonLogic.buildIncompleteAttributesError());
    }

    // Update the season
    return SeasonModelManager.seasonModel.update(seasonData, { where: { id: seasonData.id } })
      .then((thing: [number, ISeasonInstance[]]) => {
        console.log("season-logic.update() " + seasonData.seasonName + " was successfully updated.");
        return Promise.resolve(true);
      })
      .catch((err) => {
        Promise.reject(LogicError.firmUpError(err));
      });
  }

  public static deleteSeason(seasonId: number): Promise<boolean> {
    console.log("season-logic.delete() - deleteSeason has been called.");
    return SeasonModelManager.seasonModel.destroy( { where: { id: seasonId } })
      .then((numberSeasonsDeleted: number) => {
        if (numberSeasonsDeleted === 1) {
          console.log("season-logic.delete() - Season with ID of " + seasonId + " was successfully deleted.");
          return Promise.resolve(true);
        }
        else {
          console.log("season-logic.delete() - Season with ID of " + seasonId + " was not found.");
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        console.log("season-logic.delete() - Some type of error occurred.  Err message = " + err.message );
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

// Private functions

  private static isNewSeasonValid(leagueData: ISeasonAttribute): boolean {
    return (leagueData.seasonName != null &&
      leagueData.description != null);
      // Begin date and end date are optional
  }

  private static isExistingSeasonValid(seasonData: ISeasonAttribute): boolean {
    return (seasonData.id != null &&
      seasonData.seasonName != null &&
      seasonData.description != null);
  }

  private static buildIncompleteAttributesError(): LogicError {
    console.log("league-logic - Building error indicating that all required attributes were not specified.");
    return new LogicError(LogicError.INCOMPLETE_INPUT.name, "At least one of the required league attributes is missing.");
  }

}
