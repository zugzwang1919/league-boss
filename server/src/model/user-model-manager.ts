// Model level classes
import {LeagueAttribute} from './league-model-manager';

// Javascript packages
import * as Sequelize from 'sequelize';

export interface UserAttribute {
  id?: number;
  userName?: string;
  password?: string;
  emailAddress?: string;
  isSuperUser?: boolean;
  authenticationToken?: string;
  authenticationTokenExpiration?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserAttribute>, UserAttribute {
  getPlayerLeague: Sequelize.HasManyGetAssociationsMixin<LeagueAttribute>;
  getAdminLeague: Sequelize.HasManyGetAssociationsMixin<LeagueAttribute>;
}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> {}

export class UserModelManager {
  public static userModel: UserModel;

  public static initialize(sequelize: Sequelize.Sequelize) {
    UserModelManager.userModel = sequelize.define<UserInstance, UserAttribute>('user', {
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
