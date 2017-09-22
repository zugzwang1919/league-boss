import * as  Sequelize from 'sequelize';

import {ILeague} from './league';
import {IUserAttribute} from './user-model-manager';

// NOTE:  We're not tacking any additional information onto the interface created for
// external users (ILeague), so ILeagueAttribute has no additional attributes.  While
// we couild get rid of ILeagueAttribute, it's included to be consistent with the other
// sequelize models - and in the event we ever want to add an attribute to the database
// that is not going to be included in the external user's view.
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

  public static initialize(sequelize: Sequelize.Sequelize): void {
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

  /* Creates an actual object that implements the ILeague interface from
  any other object */
  public static createILeagueFromAnything(anyObject: any): ILeague {
    const createdLeague: ILeague = {
      id: anyObject.id,
      leagueName: anyObject.leagueName,
      description: anyObject.description,
      seasonTypeIndex: anyObject.seasonTypeIndex,
      leagueTypeIndex: anyObject.leagueTypeIndex,
    };
    return createdLeague;
  }
}
