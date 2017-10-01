// Model level classes
import {IGameInstance} from './game-model-manager';
import {ITeam} from './team';

// Javascript packages
import * as Sequelize from 'sequelize';

// Right now, no need to extend ITeam beyond what is there.
// By default, sequelize will add "CreateDate" and "UpdateDate"
export interface ITeamAttribute extends ITeam {
}

export interface ITeamInstance extends Sequelize.Instance<ITeamAttribute>, ITeamAttribute {

  getTeamOne: Sequelize.HasOneGetAssociationMixin<IGameInstance>;
  setTeamOne: Sequelize.HasOneSetAssociationMixin<IGameInstance, number>
  getTeamTwo: Sequelize.HasOneGetAssociationMixin<IGameInstance>;
  setTeamTwo: Sequelize.HasOneSetAssociationMixin<IGameInstance, number>
}

export interface ITeamModel extends Sequelize.Model<ITeamInstance, ITeamAttribute> {}

export class TeamModelManager {
  public static teamModel: ITeamModel;

  public static initialize(sequelize: Sequelize.Sequelize): void {
    TeamModelManager.teamModel = sequelize.define<ITeamInstance, ITeamAttribute>('team', {
      teamName: {
        type: Sequelize.STRING,
        unique: true,
      },
      teamShortName: {
        type: Sequelize.STRING,
        unique: true,
      },
      aliases: {
        type: Sequelize.STRING,
        get(): string[] {
          return JSON.parse(this.getDataValue('aliases'));
        },
        set(aliasValues: string[]): void {
          return this.setDataValue('aliases', JSON.stringify(aliasValues));
        },
      },
    },
      {
        freezeTableName: true, // Model tableName will be the same as the model name
      },
    );
  }

  /* Creates an actual object that implements the IUser interface from
  any other object */
  public static createITeamFromAnything(anyObject: any): ITeam {
    const createdTeam: ITeam = {
      id: anyObject.id,
      teamName: anyObject.teamName,
      teamShortName: anyObject.teamShortName,
      aliases: anyObject.aliases,
    };
    return createdTeam;
  }
}
