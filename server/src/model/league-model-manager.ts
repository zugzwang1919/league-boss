import * as  Sequelize from  'sequelize';

import {UserAttribute} from './user-model-manager';

export interface LeagueAttribute {
  id?:number;
  leagueName?:string;
  description?:string;
  seasonTypeIndex?:number;
  leagueTypeIndex?:number;
}

export interface LeagueInstance extends Sequelize.Instance<LeagueAttribute>, LeagueAttribute {
  getAdmin: Sequelize.HasManyGetAssociationsMixin<UserAttribute>;
  hasAdmin: Sequelize.HasManyHasAssociationMixin<UserAttribute, number>;
  addAdmin: Sequelize.HasManyAddAssociationMixin<UserAttribute, number>;
  removeAdmin: Sequelize.HasManyRemoveAssociationsMixin<UserAttribute, number>;
  /*
  removeAdmin ( oldAssociated?: UserAttribute | number,
                options?: Sequelize.HasManyRemoveAssociationMixinOptions | Sequelize.InstanceUpdateOptions
               ): Promise<number>;
  */

  getPlayer: Sequelize.HasManyGetAssociationsMixin<UserAttribute>;
  hasPlayer: Sequelize.HasManyHasAssociationMixin<UserAttribute, number>;
  addPlayer: Sequelize.HasManyAddAssociationMixin<UserAttribute, number>;
  removePlayer: Sequelize.HasManyRemoveAssociationsMixin<UserAttribute, number>;
  /*
  removePlayer( oldAssociated?: UserAttribute | number,
                options?: Sequelize.HasManyRemoveAssociationMixinOptions | Sequelize.InstanceUpdateOptions
              ): Promise<number>;
  */

}

export interface LeagueModel extends Sequelize.Model<LeagueInstance, LeagueAttribute> {}

export class LeagueModelManager {
  static leagueModel: LeagueModel;
  
  static initialize(sequelize: Sequelize.Sequelize) {
    LeagueModelManager.leagueModel = sequelize.define('league', {
      leagueName: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING
      },
      seasonTypeIndex: {
        type: Sequelize.INTEGER
      },
      leagueTypeIndex: {
        type: Sequelize.INTEGER
      },
    },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )
  }
}