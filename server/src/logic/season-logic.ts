// Logic level classes
import {Logic} from './logic';
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

interface IGameValues  {
  group: string;
  game: IGameInstance;
}

export class SeasonLogic extends Logic<ISeasonInstance> {
  private static theInstance: SeasonLogic;

  public static instanceOf(): SeasonLogic {
    if (!SeasonLogic.theInstance) {
      SeasonLogic.theInstance = new SeasonLogic();
    }
    return SeasonLogic.theInstance;
  }

  constructor() {
    super(SeasonModelManager.seasonModel);
  }

  public create(seasonData: ISeasonAttribute): Promise<ISeasonInstance> {
    console.log("  season-logic.create() - createSeason has been called.");
    // Ensure all of the required inputs are present
    if (!SeasonLogic.isNewSeasonValid(seasonData)) {
      return Promise.reject(SeasonLogic.buildIncompleteAttributesError());
    }
    return super.create(seasonData);
  }

  public update(seasonData: ISeasonAttribute): Promise<boolean> {
    console.log("  season-logic.update() - updateSeason has been called.");
    // Ensure all of the required inputs are present
    if (!SeasonLogic.isExistingSeasonValid(seasonData)) {
      return Promise.reject(SeasonLogic.buildIncompleteAttributesError());
    }
    return super.update(seasonData);
  }

  public addSchedule(seasonId: number, scheduleAsCsv: Buffer): Promise<boolean> {
    const readableStream: Stream.Readable = new Stream.Readable();
    return new Promise<boolean> ((resolve, reject) => {

      // Construct a csv parser (to be used below) using a javascript based npm package that takes a csv,
      // parses it, and returns the results as an array of game-like objects
      const parser: Parse.Parser = Parse({ columns : true }, (parseError: any, games: any[]) => {
        if (parseError) {
          return reject(parseError);
        }
        // Define a couple of variables that we'll use throughout the Promise chain
        const teamCache: TeamCache = new TeamCache();
        let season: ISeasonInstance;
        let bigFatTransaction: Sequelize.Transaction;

        // Start a Transaction allowing us to ensure that either all of this
        // will get created or none of it will
        return SeasonModelManager.sequelize.transaction((t: Sequelize.Transaction) => {
          // Find the season
          bigFatTransaction = t;
          return this.findById(seasonId)
          .then((foundSeason: ISeasonInstance) => {
            season = foundSeason;
            return foundSeason.getGames();
          })
          .then((existingSeasonGames: IGameInstance[]) => {
            if (existingSeasonGames.length !== 0 ) {
              throw (LogicError.SCHEDULE_ALREADY_PRESENT);
            }
            // Wait for the TeamCache to be created
            return teamCache.ready;
          })
          .then((success: boolean) => {
            // Build all of the games
            return Promise.map(games, (gameData: any): Promise<IGameValues> => {
              return SeasonLogic.createGame(gameData, teamCache, bigFatTransaction);
            });
          })
          .then((newGameValues: IGameValues[]) => {
            // Add the games to the season
            const newGames: IGameInstance[] = newGameValues.map((gameValue: IGameValues) => gameValue.game );
            return season.addGames(newGames, {transaction: bigFatTransaction});
          });
        })
        // End of Transaction
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

  private static createGame(gameData: any, teamCache: TeamCache, currentTransaction: Sequelize.Transaction): Promise<IGameValues> {

    // OK, this code needs to return a Promise<IGameInstance>
    if (!gameData.teamOneTwoRelationship) {
      gameData.teamOneTwoRelationship = "@";
    }
    const teamOne: ITeamInstance = teamCache.locateTeamWithAlias(gameData.teamOne);
    const teamTwo: ITeamInstance = teamCache.locateTeamWithAlias(gameData.teamTwo);
    if (!teamOne || !teamTwo) {
      return Promise.reject(LogicError.TEAM_NOT_FOUND);
    }
    let createdGame: IGameInstance;
    return GameModelManager.gameModel.create(gameData, {transaction: currentTransaction})
      .then((returnedGame: IGameInstance) => {
        createdGame = returnedGame;
        return createdGame.setTeamOne(teamOne, {transaction: currentTransaction});
      })
      .then(() => {
        return createdGame.setTeamTwo(teamTwo, {transaction: currentTransaction});
      })
      .then(() => {
        return Promise.resolve({group: gameData.gameGroup, game: createdGame});
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
