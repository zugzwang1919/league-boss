import * as  Sequelize from 'sequelize';

import {ILeague} from './league';
import {IUserAttribute, IUserInstance} from './user-model-manager';

// NOTE:  We're not tacking any additional information onto the interface created for
// external users (ILeague), so ILeagueAttribute has no additional attributes.  While
// we couild get rid of ILeagueAttribute, it's included to be consistent with the other
// sequelize models - and in the event we ever want to add an attribute to the database
// that is not going to be included in the external user's view.
export interface ILeagueAttribute extends ILeague {}

export interface ILeagueInstance extends Sequelize.Instance<ILeagueAttribute>, ILeagueAttribute {

  // Note: Not sure why this first name needs to be 'getAdmin' vs 'getAdmins'
  getAdmin: Sequelize.HasManyGetAssociationsMixin<IUserInstance>;
  setAdmins: Sequelize.HasManySetAssociationsMixin<IUserInstance, number>;
  addAdmins: Sequelize.HasManyAddAssociationsMixin<IUserInstance, number>;
  addAdmin: Sequelize.HasManyAddAssociationMixin<IUserInstance, number>;
  createAdmin: Sequelize.HasManyCreateAssociationMixin<IUserInstance, IUserInstance>;
  // Note removeAdmin signature provided below, as this didn't seem to match
  // removeAdmin: Sequelize.HasManyRemoveAssociationMixin<IUserInstance, number>;
  removeAdmins: Sequelize.HasManyRemoveAssociationsMixin<IUserInstance, number>;
  hasAdmin: Sequelize.HasManyHasAssociationMixin<IUserInstance, number>;
  hasAdmins: Sequelize.HasManyHasAssociationsMixin<IUserInstance, number>;
  countAdmins: Sequelize.HasManyCountAssociationsMixin;

  // Note: Not sure why this first name needs to be 'getPlayer' vs 'getPlayers'
  getPlayer: Sequelize.HasManyGetAssociationsMixin<IUserInstance>;
  setPlayers: Sequelize.HasManySetAssociationsMixin<IUserInstance, number>;
  addPlayers: Sequelize.HasManyAddAssociationsMixin<IUserInstance, number>;
  addPlayer: Sequelize.HasManyAddAssociationMixin<IUserInstance, number>;
  createPlayer: Sequelize.HasManyCreateAssociationMixin<IUserInstance, IUserInstance>;
  // Note removeAdmin signature provided below, as this didn't seem to match
  // removePlayer: Sequelize.HasManyRemoveAssociationMixin<IUserInstance, number>;
  removePlayers: Sequelize.HasManyRemoveAssociationsMixin<IUserInstance, number>;
  hasPlayer: Sequelize.HasManyHasAssociationMixin<IUserInstance, number>;
  hasPlayers: Sequelize.HasManyHasAssociationsMixin<IUserInstance, number>;
  countPlayers: Sequelize.HasManyCountAssociationsMixin;

  // OK... Provide signatures that appear to be different from the typings that we have
  removeAdmin(index: number): Promise<number>;
  removePlayer(index: number): Promise<number>;

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
