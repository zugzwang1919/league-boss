import * as  Sequelize from 'sequelize';

import {UserModelManager} from './user-model-manager';
import {IUserInstance} from './user-model-manager';
import {IUserModel} from './user-model-manager';

import {LeagueModelManager} from './league-model-manager';
import {ILeagueInstance} from './league-model-manager';
import {ILeagueModel} from './league-model-manager';

export class ModelManager {

  public constructor( populateWithTestData?: boolean) {

    const sequelize: Sequelize.Sequelize = new Sequelize('leagueboss', 'root', 'tchssoccer', {
        host: 'localhost',
        dialect: 'mysql',
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
    });

    // Create the Sequelize Models for all of our persistent objects
    UserModelManager.initialize(sequelize);
    LeagueModelManager.initialize(sequelize);

    // Describe the relationships between the presistent objects
    const userModel: IUserModel = UserModelManager.userModel;
    const leagueModel: ILeagueModel = LeagueModelManager.leagueModel;

    userModel.belongsToMany(leagueModel, {as: 'PlayerLeagues', through: 'LeaguePlayer' });
    leagueModel.belongsToMany(userModel, {as: 'Players', through: 'LeaguePlayer'});
    userModel.belongsToMany(leagueModel, {as: 'AdminLeagues', through: 'LeagueAdmin' });
    leagueModel.belongsToMany(userModel, {as: 'Admins', through: 'LeagueAdmin'});

    // Seed the DB if requested to do so
    if (populateWithTestData) {
      this.seedTestData(sequelize);

    }
  }

  private seedTestData(sequelize: Sequelize.Sequelize): void {

    let user1: IUserInstance;
    let user2: IUserInstance;
    let league1: ILeagueInstance;
    let league2: ILeagueInstance;

    sequelize.sync({force: true})
      .then((syncResults) => {
        return UserModelManager.userModel.create({
          userName: 'RWW',
          password: 'RWW',
          emailAddress: 'russ.wolfe@gmail.com',
          isSuperUser: true,
        });
      })
      .then((createdUser: IUserInstance) => {
        user1 = createdUser;
        return UserModelManager.userModel.create({
          userName: 'TB',
          password: 'TB',
          emailAddress: 'tom.brady@gmail.com',
          isSuperUser: false,
        });
      })
      .then((createdUser: IUserInstance) => {
        user2 = createdUser;
        return LeagueModelManager.leagueModel.create({
          leagueName: 'NFL Chumps',
          description: 'The worst collection ever of NFL enthusiasts.',
          seasonTypeIndex: 0,
          leagueTypeIndex: 0,

        });
      })
      .then((createdLeague: ILeagueInstance) => {
        league1 = createdLeague;
        league1.addPlayer(user1);
        league1.addPlayer(user2);
        league1.addAdmin(user1);
        league1.addAdmin(user2);
        return LeagueModelManager.leagueModel.create({
          leagueName: 'Winners not Weiners',
          description: 'Yeah, we are that good.',
          seasonTypeIndex: 1,
          leagueTypeIndex: 2,
        });
      })
      .then((league) => {
          league2 = league;
          league2.addPlayer(user2);
          return league2.addAdmin(user2);
      })
      .catch((err) => {
        console.log("error name = " + err.name + ".  Error Message = " + err.message);
      });
  }

}
