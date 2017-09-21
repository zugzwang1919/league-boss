import * as  Sequelize from 'sequelize';

import {IUserAttribute} from './user-model-manager';

export interface ILeague {
  id?: number;
  leagueName?: string;
  description?: string;
  seasonTypeIndex?: number;
  leagueTypeIndex?: number;
}

export interface ILeagueAttribute extends ILeague {}

export interface ILeagueInstance extends Sequelize.Instance<ILeagueAttribute>, ILeagueAttribute {
  getAdmin: Sequelize.HasManyGetAssociationsMixin<IUserAttribute>;
  hasAdmin: Sequelize.HasManyHasAssociationMixin<IUserAttribute, number>;
  addAdmin: Sequelize.HasManyAddAssociationMixin<IUserAttribute, number>;
  removeAdmin: Sequelize.HasManyRemoveAssociationsMixin<IUserAttribute, number>;
  /*
  removeAdmin ( oldAssociated?: UserAttribute | number,
                options?: Sequelize.HasManyRemoveAssociationMixinOptions | Sequelize.InstanceUpdateOptions
               ): Promise<number>;
  */

  getPlayer: Sequelize.HasManyGetAssociationsMixin<IUserAttribute>;
  hasPlayer: Sequelize.HasManyHasAssociationMixin<IUserAttribute, number>;
  addPlayer: Sequelize.HasManyAddAssociationMixin<IUserAttribute, number>;
  removePlayer: Sequelize.HasManyRemoveAssociationsMixin<IUserAttribute, number>;
  /*
  removePlayer( oldAssociated?: UserAttribute | number,
                options?: Sequelize.HasManyRemoveAssociationMixinOptions | Sequelize.InstanceUpdateOptions
              ): Promise<number>;
  */

}

export interface ILeagueModel extends Sequelize.Model<ILeagueInstance, ILeagueAttribute> {}

export class LeagueModelManager {
  public static leagueModel: ILeagueModel;

  public static initialize(sequelize: Sequelize.Sequelize) {
    LeagueModelManager.leagueModel = sequelize.define('league', {
      leagueName: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      seasonTypeIndex: {
        type: Sequelize.INTEGER,
      },
      leagueTypeIndex: {
        type: Sequelize.INTEGER,
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }
}
