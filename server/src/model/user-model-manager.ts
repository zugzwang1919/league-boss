// Model level classes
import {ILeague} from './league-model-manager';

// Javascript packages
import * as Sequelize from 'sequelize';

export interface IUser {
  id?: number;
  userName?: string;
  password?: string;
  emailAddress?: string;
  isSuperUser?: boolean;
}

export interface IUserAttribute extends IUser {
  authenticationToken?: string;
  authenticationTokenExpiration?: Date;
}

export interface IUserInstance extends Sequelize.Instance<IUserAttribute>, IUserAttribute {
  getPlayerLeague: Sequelize.HasManyGetAssociationsMixin<ILeague>;
  getAdminLeague: Sequelize.HasManyGetAssociationsMixin<ILeague>;
}

export interface IUserModel extends Sequelize.Model<IUserInstance, IUserAttribute> {}

export class UserModelManager {
  public static userModel: IUserModel;

  public static initialize(sequelize: Sequelize.Sequelize) {
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
}
