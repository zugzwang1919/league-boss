// Logic level classes
import {LogicError} from './logic-error';
import {UserLogic} from './user-logic';

// Model level classes
import {GameModelManager, IGameInstance} from '../model/game-model-manager';
import {ISeasonAttribute, ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';
import {ITeamInstance, TeamModelManager} from '../model/team-model-manager';

// Javascript packages
import * as Promise from 'bluebird';
import * as parse from 'csv-parse';
import * as stream from 'stream';
import { TeamCache } from './team-cache';

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
    const readableStream: stream.Readable = new stream.Readable();
    return new Promise<boolean> ((resolve, reject) => {
      // Create a readable stream from the buffer
      readableStream.push(scheduleAsCsv);
      readableStream.push(null);

      // Construct a csv parser using a javascript based npm package
      const parser: parse.Parser = parse({ columns : true }, (parseError: any, games: any[]) => {
        if (parseError) {
          reject(parseError);
        }
        // Get the cache of teams (We'll have to wait for it to be created)
        const teamCache: TeamCache = new TeamCache();
        return teamCache.ready
        .then((success: boolean) => {
          return Promise.map(games, (gameData: any) => {
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
          });
        })
        .then((newGames: IGameInstance[]) => {
          resolve(true);
        })
        .catch((otherError: any) => {
          reject(otherError);
        });
      });

      // Pipe the stream into the parser
      readableStream.pipe(parser);
  });
}
// Private functions

  private static createGame(gameData: any): Promise<IGameInstance> {
    if (!gameData.teamOneTwoRelationship) {
      gameData.teamOneTwoRelationship = "@";
    }
    return GameModelManager.gameModel.create(gameData)
    .then((createdGame: IGameInstance) => {
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
