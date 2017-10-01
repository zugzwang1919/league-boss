// Model level classes
import { IFlattenedGame, IGame } from './game';
import { ITeamInstance } from './team-model-manager';

// Javascript packages
import * as Sequelize from 'sequelize';

// NOTE:  We're not tacking any additional information onto the interface created for
// external users (IGame), so IGameAttribute has no additional attributes.  While
// we couild get rid of IGameAttribute, it's included to be consistent with the other
// sequelize models - and in the event we ever want to add an attribute to the database
// that is not going to be included in the external user's view.
// By default, sequelize will add "CreateDate" and "UpdateDate"
export interface IGameAttribute extends IGame {
}

export interface IGameInstance extends Sequelize.Instance<IGameAttribute>, IGameAttribute {

  getTeamOne: Sequelize.HasOneGetAssociationMixin<ITeamInstance>;
  setTeamOne: Sequelize.HasOneSetAssociationMixin<ITeamInstance, number>
  getTeamTwo: Sequelize.HasOneGetAssociationMixin<ITeamInstance>;
  setTeamTwo: Sequelize.HasOneSetAssociationMixin<ITeamInstance, number>

}

export interface IGameModel extends Sequelize.Model<IGameInstance, IGameAttribute> {}

export class GameModelManager {
  public static gameModel: IGameModel;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    GameModelManager.gameModel = sequelize.define<IGameInstance, IGameAttribute>('game', {
      gameDate: {
        type: Sequelize.DATEONLY,
      },
      teamOneScore: {
        type: Sequelize.INTEGER,
      },
      teamOnePointSpread: {
        type: Sequelize.DECIMAL(10, 1),
        unique: true,
      },

      teamOneTwoRelationship: {
        type: Sequelize.STRING,
      },

      teamTwoScore: {
        type: Sequelize.INTEGER,
      },
      teamTwoPointSpread: {
        type: Sequelize.DECIMAL(10, 1),
        unique: true,
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }

  /* Creates an actual object that implements the IUser interface from
  any other object */
  public static createFlattenedGame(gameInstance: IGameInstance): Promise<IFlattenedGame> {
    const createdGame: IFlattenedGame = {

      id: gameInstance.id,
      teamOneScore: gameInstance.teamOneScore,
      teamOnePointspread: gameInstance.teamOnePointspread,
      teamOneTwoRelationship: gameInstance.teamOneTwoRelationship,
      teamTwoScore: gameInstance.teamTwoScore,
      teamTwoPointspread: gameInstance.teamTwoPointspread,
    };

    return new Promise<IFlattenedGame>((resolve, reject) => gameInstance.getTeamOne()
      .then((teamOne: ITeamInstance) => {
        createdGame.teamOneName = teamOne.teamName;
        createdGame.teamOneShortName = teamOne.teamShortName;
        return gameInstance.getTeamTwo();
      })
      .then((teamTwo: ITeamInstance) => {
        createdGame.teamTwoName = teamTwo.teamName;
        createdGame.teamTwoShortName = teamTwo.teamShortName;
        resolve(createdGame);
      })
      .catch((error) => {
        reject(error);
      }));
  }
}
