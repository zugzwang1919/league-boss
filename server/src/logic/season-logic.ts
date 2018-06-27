// Logic level classes
import {CsvLogic} from './csv-logic';
import {GameGroupLogic} from './game-group-logic';
import {Logic} from './logic';
import {LogicError} from './logic-error';
import {TeamCache} from './team-cache';

// Model level classes
import {GameGroupModelManager, IGameGroupAttribute, IGameGroupInstance, IGameGroupModel} from '../model/game-group-model-manager';
import {GameModelManager, IGameInstance} from '../model/game-model-manager';
import {ISeasonAttribute, ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';
import {ITeamInstance, TeamModelManager} from '../model/team-model-manager';

// Javascript packages
import * as Promise from 'bluebird';
import * as Parse from 'csv-parse';
import * as Sequelize from 'sequelize';

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

  public addSchedule(seasonId: number, scheduleAsCsv: Buffer): Promise<void> {

    // Define a couple of variables that we'll use throughout the Promise chain
    const teamCache: TeamCache = new TeamCache();
    let season: ISeasonInstance;
    let gameGroups: IGameGroupInstance[];
    let arrayOfGameValues: IGameValues[];
    // Start a Transaction allowing us to ensure that either all of this
    // will get created or none of it will
    // Set the isolation level to READ UNCOMMITTED so that we can read data that's been added during the transaction
    return this.findById(seasonId)
      .then((foundSeason: ISeasonInstance) => {
        season = foundSeason;
        return foundSeason.getGameGroups();
      })
      .then((existingSeasonGameGroups: IGameGroupInstance[]) => {
        if (existingSeasonGameGroups.length !== 0 ) {
          throw (LogicError.SCHEDULE_ALREADY_PRESENT);
        }
        // Wait for the TeamCache to be created
        return teamCache.ready;
      })
      .then((success: boolean) => {
        // Get all of the games out of the schedule
        return CsvLogic.getGameData(scheduleAsCsv);
      })
      .then((games: any[]) => {
        // Build all of the games
        return Promise.map(games, (gameData: any): Promise<IGameValues> => {
          return SeasonLogic.createGame(gameData, teamCache, season);
        });
      })
      .then((createdGameValues: IGameValues[]) => {
        // Build all of the game groups
        arrayOfGameValues = createdGameValues;
        return SeasonLogic.createGameGroups(arrayOfGameValues);
      })
      .then((createdGameGroups: IGameGroupInstance[]) => {
        // Add the game groups to the season
        gameGroups = createdGameGroups;
        return season.addGameGroups(createdGameGroups);
      })
      .then(() => {
        // Add the games to the game groups
        return Promise.map(arrayOfGameValues, (gameValues: IGameValues): Promise<void> => {
          const foundGameGroup: IGameGroupInstance = gameGroups.find((gameGroup) => gameGroup.gameGroupName === gameValues.group );
          return foundGameGroup.addGame(gameValues.game);
        });
      })
      .then(() => {
        // Get all of the games - organized by GameGroup
        return Promise.map(gameGroups, (gameGroup: IGameGroupInstance): Promise<IGameInstance[]> => {
          const foundGames: Promise<IGameInstance[]> = gameGroup.getGames();
          return foundGames;
        });
      })
      .then((arrayOfGamesInGameGroup: IGameInstance[][]) => {
        // Update each GameGroup with its earliest and latest date
        return Promise.map(arrayOfGamesInGameGroup, (gamesInGroup: IGameInstance[], index: number): Promise<any> => {
          const gameGroup: IGameGroupInstance = gameGroups[index];
          gamesInGroup.forEach ((game: IGameInstance) => {
            if ( !gameGroup.earliestGameDate || gameGroup.earliestGameDate > game.gameDate ) {
              gameGroup.earliestGameDate = game.gameDate;
            }
            if ( !gameGroup.latestGameDate || gameGroup.latestGameDate < game.gameDate ) {
              gameGroup.latestGameDate = game.gameDate;
            }
          });
          const updateData: any = {
            id: gameGroup.id,
            earliestGameDate:  gameGroup.earliestGameDate,
            latestGameDate: gameGroup.latestGameDate,
          };
          return GameGroupLogic.instanceOf().update(updateData);
        });
      })
      .then(() => {
        return Promise.resolve(true);
      })
      .catch((otherError: any) => {
        return Promise.reject(otherError);
      });
  }

  public getGameGroups(seasonId: number): Promise<IGameGroupAttribute[]> {
    return this.findById(seasonId)
      .then((season: ISeasonInstance) => {
        return season.getGameGroups();
      })
      .catch((err) => {
        return Promise.reject(LogicError.firmUpError(err));
      });
  }
  // Private functions

  private static createGame(gameData: any, teamCache: TeamCache, season: ISeasonInstance, currentTransaction?: Sequelize.Transaction): Promise<IGameValues> {
    // OK, this code needs to return a Promise<IGameValues>
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

  private static createGameGroups(arrayOfGameValues: IGameValues[]): Promise<IGameGroupInstance[]> {
    const gameGroupNames: string[] = [];
    arrayOfGameValues.forEach((gameValues) => {
      if (gameGroupNames.indexOf(gameValues.group) === -1) {
        gameGroupNames.push(gameValues.group);
      }
    });
    return Promise.map(gameGroupNames, (gameGroupName): Promise<IGameGroupInstance> => {
      return GameGroupModelManager.gameGroupModel.create({gameGroupName});
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
