import {GameGroupModelManager, IGameGroupModel} from './game-group-model-manager';
import {GameModelManager, IGameModel} from './game-model-manager';
import {ILeagueInstance, ILeagueModel, LeagueModelManager} from './league-model-manager';
import {IPickModel, PickModelManager} from './pick-model-manager';
import {ISeasonInstance, ISeasonModel, SeasonModelManager} from './season-model-manager';
import {ITeam} from './team';
import {ITeamInstance, ITeamModel, TeamModelManager} from './team-model-manager';
import {IUserInstance, IUserModel, UserModelManager} from './user-model-manager';

import * as Promise from 'bluebird';
import * as Sequelize from 'sequelize';

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
    TeamModelManager.initialize(sequelize);
    GameModelManager.initialize(sequelize);
    GameGroupModelManager.initialize(sequelize);
    SeasonModelManager.initialize(sequelize);
    PickModelManager.initialize(sequelize);

    // Describe the relationships between the presistent objects
    const userModel: IUserModel = UserModelManager.userModel;
    const leagueModel: ILeagueModel = LeagueModelManager.leagueModel;
    const teamModel: ITeamModel = TeamModelManager.teamModel;
    const gameModel: IGameModel = GameModelManager.gameModel;
    const gameGroupModel: IGameGroupModel = GameGroupModelManager.gameGroupModel;
    const seasonModel: ISeasonModel = SeasonModelManager.seasonModel;
    const pickModel: IPickModel = PickModelManager.pickModel;

    // Users can belong to many Leagues & Leagues have many Users
    // (And we want to be able to navigate in both directions)
    userModel.belongsToMany(leagueModel, {as: 'PlayerLeagues', through: 'LeaguePlayer' });
    leagueModel.belongsToMany(userModel, {as: 'Players', through: 'LeaguePlayer'});
    userModel.belongsToMany(leagueModel, {as: 'AdminLeagues', through: 'LeagueAdmin' });
    leagueModel.belongsToMany(userModel, {as: 'Admins', through: 'LeagueAdmin'});

    // Game references two teams
    teamModel.hasMany(gameModel, {as: 'TeamOne', foreignKey: 'teamOneId'});
    gameModel.belongsTo(teamModel, {as: 'TeamOne', foreignKey: 'teamOneId'});
    teamModel.hasMany(gameModel, {as: 'TeamTwo', foreignKey: 'teamTwoId'});
    gameModel.belongsTo(teamModel, {as: 'TeamTwo', foreignKey: 'teamTwoId'});

    // A League has one season
    // A Season can be associated with many Leagues
    seasonModel.hasMany(leagueModel, {onDelete: 'restrict'});
    leagueModel.belongsTo(seasonModel);

    // Season owns GameGroups
    seasonModel.hasMany(gameGroupModel, {onDelete: 'cascade'});
    gameGroupModel.belongsTo(seasonModel);

    // GameGroup owns Games
    gameGroupModel.hasMany(gameModel, {onDelete: 'cascade'});
    gameModel.belongsTo(gameGroupModel);

    // Pick references a Game and a Team
    pickModel.belongsTo(gameModel);
    pickModel.belongsTo(teamModel, {as: 'TeamPicked', foreignKey: 'teamPickedId'});

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
        return this.seedAllTeams();
      })
      .then((teamResults) => {
        return UserModelManager.userModel.create({
          userName: 'RWW',
          password: 'RWW',
          emailAddress: 'russell.wolfe@gmail.com',
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
        return UserModelManager.userModel.create({
          userName: 'Larry',
          password: 'Larry',
          emailAddress: 'larry@gmail.com',
          isSuperUser: true,
        });
      })
      .then((createdUser: IUserInstance) => {
        return UserModelManager.userModel.create({
          userName: 'CT',
          password: 'CT',
          emailAddress: 'ct@gmail.com',
          isSuperUser: true,
        });
      })
      .then((createdUser: IUserInstance) => {
        return LeagueModelManager.leagueModel.create({
          leagueName: 'NFL Chumps',
          description: 'The worst collection ever of NFL enthusiasts.',
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

  private seedAllTeams(): Promise<boolean> {
    const results: Array<Promise<ITeamInstance>> = new Array<Promise<ITeamInstance>>();
    results.push(this.createTeam("Arizona Cardinals", "Cardinals", ["Arizona", "Cardinals", "Ari", "Cards"]));
    results.push(this.createTeam("Atlanta Falcons", "Falcons", ["Atlanta", "Falcons", "Atl"]));
    results.push(this.createTeam("Baltimore Ravens", "Ravens", ["Baltimore", "Ravens", "Balt", "Blt"]));
    results.push(this.createTeam("Buffalo Bills", "Bills", ["Buffalo", "Bills", "Buff", "Buf"]));
    results.push(this.createTeam("Carolina Panthers", "Panthers", ["Carolina", "Panthers", "Car"]));
    results.push(this.createTeam("Chicago Bears", "Bears", ["Chciago", "Bears", "Chi"]));
    results.push(this.createTeam("Cincinnati Bengals", "Bengals", ["Cincinnati", "Bengals", "Cin"]));
    results.push(this.createTeam("Cleveland Browns", "Browns", ["Cleveland", "Browns", "Cle"]));
    results.push(this.createTeam("Dallas Cowboys", "Cowboys", ["Dallas", "Cowboys", "Dal"]));
    results.push(this.createTeam("Denver Broncos", "Broncos", ["Denver", "Broncos", "Den"]));
    results.push(this.createTeam("Detroit Lions", "Lions", ["Detroit", "Lions", "Det"]));
    results.push(this.createTeam("Green Bay Packers", "Packers", ["Green Bay", "Packers", "Green", "GB", "Gre"]));
    results.push(this.createTeam("Houston Texans", "Texans", ["Houston", "Texans", "Hou"]));
    results.push(this.createTeam("Indianapolis Colts", "Colts", ["Indianapolis", "Colts", "Ind", "Indy"]));
    results.push(this.createTeam("Jacksonville Jaguars", "Jaguars", ["Jacksonville", "Jaguars", "Jac", "Jack", "Jag", "Jags"]));
    results.push(this.createTeam("Kansas City Chiefs", "Chiefs", ["Kansas City", "Chiefs", "KC", "Kan"]));
    results.push(this.createTeam("Los Angeles Chargers", "Chargers", ["LAC", "Chargers"]));
    results.push(this.createTeam("Los Angeles Rams", "Rams", ["LAR", "Rams"]));
    results.push(this.createTeam("Miami Dolphins", "Dolphins", ["Miami", "Dolphins", "Mia"]));
    results.push(this.createTeam("Minnesota Vikings", "Vikings", ["Minnesota", "Vikings", "Minn", "Min"]));
    results.push(this.createTeam("New England Patriots", "Patriots", ["New England", "Patriots", "NE", "Pats"]));
    results.push(this.createTeam("New Orleans Saints", "Saints", ["New Orleans", "Saints", "NO"]));
    results.push(this.createTeam("New York Giants", "Giants", ["Giants", "NYG"]));
    results.push(this.createTeam("New York Jets", "Jets", ["Jets", "NYJ"]));
    results.push(this.createTeam("Oakland Raiders", "Raiders", ["Oakland", "Raiders", "Oak"]));
    results.push(this.createTeam("Philadelphia Eagles", "Eagles", ["Philadalphia", "Eagles", "Phi", "Phil", "Phl"]));
    results.push(this.createTeam("Pittsburgh Steelers", "Steelers", ["Pittsburgh", "Steelers", "Pit", "Pitt"]));
    results.push(this.createTeam("San Francisco 49ers", "49ers", ["San Francisco", "49ers", "SF", "San"]));
    results.push(this.createTeam("Seattle Seahawks", "Seahawks", ["Seattle", "Seahawks", "Sea"]));
    results.push(this.createTeam("Tampa Bay Bucs", "Bucs", ["Tampa Bay", "Bucs", "TB", "Tam"]));
    results.push(this.createTeam("Tennessee Titans", "Titans", ["Tennessee", "Titans", "Ten", "Tenn"]));
    results.push(this.createTeam("Washington Redskins", "Redskins", ["Washington", "Redskins", "Wash", "Was"]));
    return Promise.all(results)
      .then((values) => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject({ error: "At least one of the teams could not be inserted."});
      });

  }
  private createTeam(teamName: string, teamShortName: string, aliases: string[]): Promise<ITeamInstance> {
    const createdTeam: ITeam = {
      teamName,
      teamShortName,
      aliases,
    };
    return TeamModelManager.teamModel.create(createdTeam);
  }
}
