// Logic level classes
import {LogicError} from './logic-error';
import {TeamCache} from './team-cache';
import {UserLogic} from './user-logic';

// Model level classes
import {GameModelManager, IGameInstance} from '../model/game-model-manager';
import {ISeasonAttribute, ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';
import {ITeamInstance, TeamModelManager} from '../model/team-model-manager';

// Javascript packages
import * as Promise from 'bluebird';
import * as Parse from 'csv-parse';
import * as Sequelize from 'sequelize';
import * as Stream from 'stream';

export class SeasonLogic {

  public static findSeasonById(seasonId: number): Promise<ISeasonInstance> {
    console.log("season-logic.findById() - findSeasonById has been called.");
    return SeasonModelManager.seasonModel.findById(seasonId)
    .then((foundSeason: ISeasonInstance) => {
      if (foundSeason != null) {
        console.log("season-logic - season found!!!");
        return Promise.resolve(foundSeason);
      }
      else {
        console.log("season-logic - sesaon was not found!!!");
        return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
      }
    });
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

  public static addSchedule(seasonId: number, scheduleAsCsv: Buffer): Promise<boolean> {
    const readableStream: Stream.Readable = new Stream.Readable();
    return new Promise<boolean> ((resolve, reject) => {

      // Construct a csv parser (to be used below) using a javascript based npm package that takes a csv,
      // parses it, and returns the results as an array of game-like objects
      const parser: Parse.Parser = Parse({ columns : true }, (parseError: any, games: any[]) => {
        if (parseError) {
          reject(parseError);
        }
        // Define a couple of variables that we'll use throughout the Promise chain
        const teamCache: TeamCache = new TeamCache();
        let season: ISeasonInstance;
        // Find the season
        return SeasonLogic.findSeasonById(seasonId)
        .then((foundSeason: ISeasonInstance) => {
          season = foundSeason;
          // Wait for the TeamCache to be created
          return teamCache.ready;
        })
        .then((success: boolean) => {
          // Build all of the games
          return Promise.map(games, (gameData: any): Promise<IGameInstance> => {
            return SeasonLogic.createGame(gameData, teamCache);
          });
        })
        .then((newGames: IGameInstance[]) => {
          // Add the games to the season
          return season.addGames(newGames);
        })
        .then(() => {
          resolve(true);
        })
        .catch((otherError: any) => {
          reject(otherError);
        });
      });

      // Now that we have a parser...
      // Create a readable stream from the buffer
      readableStream.push(scheduleAsCsv);
      readableStream.push(null);
      // Pipe the stream into the parser
      readableStream.pipe(parser);
  });
}
// Private functions

  private static createGame(gameData: any, teamCache: TeamCache): Promise<IGameInstance> {

    // OK, this code needs to return a Promise<IGameInstance>
    if (!gameData.teamOneTwoRelationship) {
      gameData.teamOneTwoRelationship = "@";
    }
    const teamOne: ITeamInstance = teamCache.locateTeamWithAlias(gameData.teamOne);
    if (!teamOne) {
      return Promise.reject(LogicError.TEAM_NOT_FOUND);
    }
    const teamTwo: ITeamInstance = teamCache.locateTeamWithAlias(gameData.teamTwo);
    if (!teamTwo) {
      return Promise.reject(LogicError.TEAM_NOT_FOUND);
    }
    let createdGame: IGameInstance;
    return GameModelManager.gameModel.create(gameData)
      .then((returnedGame: IGameInstance) => {
        createdGame = returnedGame;
        return createdGame.setTeamOne(teamOne);
      })
      .then(() => {
        return createdGame.setTeamTwo(teamTwo);
      })
      .then(() => {
        return Promise.resolve(createdGame);
      })
      .catch((error: any) => {
        return Promise.reject(error);
      });

  }

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
