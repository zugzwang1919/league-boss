// For sequelizeThings()
import * as  sequelize from './model/index';
import * as  DataModel from './model/dataModel';


// For start()
import * as express from  'express';
import * as bodyParser from  'body-parser';

import {UserRest}  from './rest/user-rest';
import {LeagueRest} from './rest/league-rest';
import {LoginRest} from './rest/login-rest';


  
export class Server {
  
  public app: express.Application;

  public static bootstrap(): Server {
    return new Server();
  }

  private constructor() {
    // Set up Persistence Mechanisms
    this.sequelizeThings();    
    //create expressjs application
    this.app = express();
    //configure application
    this.config();
    //add restful routes
    this.addRestRoutes();
    // Finally, listen on port 1919
    this.app.listen(1919);
  }


  public config() {
    // Indicate that we'll be using JSON in the bodies of requests and responses
    this.app.use(bodyParser.json());
      
    // I had to add this to allow javascript served from localhost:3000 to talk to localhost:1919
    // Can't say that I truly understand it
    this.app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Wolfe-Authentication-Token");
      res.header("Access-Control-Expose-Headers", "Wolfe-Authentication-Token");
      next();
    });
  }

  private addRestRoutes() {
    // Routes to our REST code
    this.app.use('/user', UserRest.getRouter());
    this.app.use('/league', LeagueRest.getRouter());
    this.app.use('/', LoginRest.getRouter());
  }

  private sequelizeThings() {
    // Prepopulate the DB... 
    // Comment out these lines most of the time.
    var USER = DataModel.USER;
    var LEAGUE = DataModel.LEAGUE;
  
  
    var user1;
    var user2;
    var league1;
    var league2;
  
    sequelize.sync({ force: true })
    .then(function () {
      return USER.create({
        userName: 'RWW',
        password: 'RWW',
        emailAddress: 'russ.wolfe@gmail.com',
        isSuperUser: true,
      })
    })
    .then(user => {
      user1 = user;
      return USER.create({
        userName: 'TB',
        password: 'TB',
        emailAddress: 'tom.brady@gmail.com',
        isSuperUser: false,
      })
    })
    .then(user => {
      user2 = user;
      return LEAGUE.create({
        leagueName: 'NFL Chumps',
        description: 'The worst collection ever of NFL enthusiasts.',
        seasonTypeIndex: 0,
        leagueTypeIndex: 0
  
      })
    })
    .then(league => {
      league1 = league;
      league1.addPlayer(user1);
      league1.addPlayer(user2);
      league1.addAdmin(user1);
      league1.addAdmin(user2);
      return LEAGUE.create({
        leagueName: 'Winners not Weiners',
        description: 'Yeah, we are that good.',
        seasonTypeIndex: 1,
        leagueTypeIndex: 2
      })
    })
    .then(league => {
      league2 = league;
      league2.addPlayer(user2);
      return league2.addAdmin(user2);
    })
    .catch(err => {
      console.log("error name = " + err.name + ".  Error Message = " + err.message)
    })   
  }
}


/*  
export function start():Promise<any> {

  sequelizeThings();

  return Promise
    .resolve(Express())
    .then((app)=> {
      // Indicate that we'll be using JSON in the bodies of requests and responses
      app.use(bodyParser.json());

      // I had to add this to allow javascript served from localhost:3000 to talk to localhost:1919
      // Can't say that I truly understand it
      app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Wolfe-Authentication-Token");
        res.header("Access-Control-Expose-Headers", "Wolfe-Authentication-Token");
        next();
      });

      // Routes to our REST code
      app.use('/user', userRoutes);
      app.use('/league', leagueRoutes);
      app.use("/", loginRoutes);

      // Finally tell the express to listen on port 1919
      app.listen(1919);
      app.
  })
}
*/
