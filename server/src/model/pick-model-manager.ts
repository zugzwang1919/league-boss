// Model level classes
import {IGameInstance} from './game-model-manager';
import {IPick} from './pick';
import {ITeamInstance} from './team-model-manager';

// Javascript packages
import * as Sequelize from 'sequelize';

// Right now, no need to extend IPick beyond what is there.
// By default, sequelize will add "CreateDate" and "UpdateDate"
export interface IPickAttribute extends IPick {
}

export interface IPickInstance extends Sequelize.Instance<IPickAttribute>, IPickAttribute {

  getGame: Sequelize.HasOneGetAssociationMixin<IGameInstance>;
  setGame: Sequelize.HasOneSetAssociationMixin<IGameInstance, number>
  getTeamPicked: Sequelize.HasOneGetAssociationMixin<ITeamInstance>;
  setTeamPicked: Sequelize.HasOneSetAssociationMixin<ITeamInstance, number>
}

export interface IPickModel extends Sequelize.Model<IPickInstance, IPickAttribute> {}

export class PickModelManager {
  public static pickModel: IPickModel;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    PickModelManager.pickModel = sequelize.define<IPickInstance, IPickAttribute>('pick', {
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name ('pick' in this instance)
      },
    );
  }

}
