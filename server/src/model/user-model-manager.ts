// Model level classes
import {ILeagueAttribute} from './league-model-manager';
import {IUser} from './user';

// Javascript packages
import * as Sequelize from 'sequelize';

export interface IUserAttribute extends IUser {
  authenticationToken?: string;
  authenticationTokenExpiration?: Date;
}

export interface IUserInstance extends Sequelize.Instance<IUserAttribute>, IUserAttribute {
  // NOTE: Not sure why these are not named getPlayerLeagues and getAdminLeagues respectively
  getPlayerLeague: Sequelize.HasManyGetAssociationsMixin<ILeagueAttribute>;
  getAdminLeague: Sequelize.HasManyGetAssociationsMixin<ILeagueAttribute>;
}

export interface IUserModel extends Sequelize.Model<IUserInstance, IUserAttribute> {}

export class UserModelManager {
  public static userModel: IUserModel;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    UserModelManager.userModel = sequelize.define<IUserInstance, IUserAttribute>('user', {
      userName: {
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
      },
      emailAddress: {
        type: Sequelize.STRING,
      },
      isSuperUser: {
        type: Sequelize.BOOLEAN,
      },
      authenticationToken: {
        type: Sequelize.STRING,
      },
      authenticationTokenExpiration: {
        type: Sequelize.DATE,
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }

  /* Creates an actual object that implements the IUser interface from
  any other object */
  public static createIUserFromAnything(anyObject: any): IUser {
    const createdLeague: IUser = {
      id: anyObject.id,
      userName: anyObject.userName,
      password: anyObject.password,
      emailAddress: anyObject.emailAddress,
      isSuperUser: anyObject.isSuperUser,
    };
    return createdLeague;
  }
}
