// Model level classes
import {IGameGroup} from './game-group';
import {IGameInstance} from './game-model-manager';

// Javascript packages
import * as Sequelize from 'sequelize';

// NOTE:  We're not tacking any additional information onto the interface created for
// external users (IGameGroup), so IGameGroupAttribute has no additional attributes.  While
// we couild get rid of IGameAttribute, it's included to be consistent with the other
// sequelize models - and in the event we ever want to add an attribute to the database
// that is not going to be included in the external user's view.
// By default, sequelize will add "CreateDate" and "UpdateDate"
export interface IGameGroupAttribute extends IGameGroup {
}

export interface IGameGroupInstance extends Sequelize.Instance<IGameGroupAttribute>, IGameGroupAttribute {
  // Define all of the methods that are available.  We don't use all of them, so I can't
  // guarantee that they all work, but they "should"
  getGames: Sequelize.HasManyGetAssociationsMixin<IGameInstance>;
  addGame: Sequelize.HasManyAddAssociationMixin<IGameInstance, number>
  addGames: Sequelize.HasManyAddAssociationsMixin<IGameInstance, number>;
  removeGames: Sequelize.HasManyRemoveAssociationsMixin<IGameInstance, number>;
  countGames: Sequelize.HasManyCountAssociationsMixin;
}

export interface IGameGroupModel extends Sequelize.Model<IGameGroupInstance, IGameGroupAttribute> {}

export class GameGroupModelManager {
  public static gameGroupModel: IGameGroupModel;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    GameGroupModelManager.gameGroupModel = sequelize.define<IGameGroupInstance, IGameGroupAttribute>('gameGroup', {
      gameGroupName: {
        type: Sequelize.STRING,
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }

}
