import * as  Sequelize from 'sequelize';

import {IGameGroupInstance} from './game-group-model-manager';
import {ISeason} from './season';

// NOTE:  We're not tacking any additional information onto the interface created for
// external users (ISeason), so ISeasonAttribute has no additional attributes.  While
// we couild get rid of ISeasonAttribute, it's included to be consistent with the other
// sequelize models - and in the event we ever want to add an attribute to the database
// that is not going to be included in the external user's view.
// By default, sequelize will add "CreateDate" and "UpdateDate"

export interface ISeasonAttribute extends ISeason {}

export interface ISeasonInstance extends Sequelize.Instance<ISeasonAttribute>, ISeasonAttribute {
  // Define all of the methods that are available.  We don't use all of them, so I can't
  // guarantee that they all work, but they "should"
  getGameGroups: Sequelize.HasManyGetAssociationsMixin<IGameGroupInstance>;
  addGameGroup: Sequelize.HasManyAddAssociationMixin<IGameGroupInstance, number>
  // Note addGameGroups: signature provided below, as this didn't seem to match
  // addGameGroups: Sequelize.HasManyAddAssociationsMixin<IGameGroupInstance, number>;
  removeGameGroups: Sequelize.HasManyRemoveAssociationsMixin<IGameGroupInstance, number>;
  countGameGroups: Sequelize.HasManyCountAssociationsMixin;

  // Signatures corrected?
  addGameGroups(gameGroups: IGameGroupInstance[], options?: Sequelize.InstanceUpdateOptions ): Promise<ISeasonInstance>;

}

export interface ISeasonModel extends Sequelize.Model<ISeasonInstance, ISeasonAttribute> {}

export class SeasonModelManager {
  public static seasonModel: ISeasonModel;
  public static sequelize: Sequelize.Sequelize;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    SeasonModelManager.sequelize = sequelize;
    SeasonModelManager.seasonModel = sequelize.define('season', {
      seasonName: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      earliestGameDate: {
        type: Sequelize.DATEONLY,
      },
      latestGameDate: {
        type: Sequelize.DATEONLY,
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }

  /* Creates an actual object that implements the ISeason interface from
  any other object */
  public static createISeasonFromAnything(anyObject: any): ISeason {
    const createdSeason: ISeason = {
      id: anyObject.id,
      seasonName: anyObject.seasonName,
      description: anyObject.description,
      earliestGameDate: anyObject.earliestGameDate,
      latestGameDate: anyObject.latestGameDate,
    };
    return createdSeason;
  }
}
