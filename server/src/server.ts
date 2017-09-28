// Rest Layer Classes
import {LeagueRest} from './rest/league-rest';
import {LoginRest} from './rest/login-rest';
import {SeasonRest} from './rest/season-rest';
import {UserRest} from './rest/user-rest';

// Model Layer Classes
import {ModelManager} from './model/model-manager';

// JavaScript packages
import * as bodyParser from 'body-parser';
import * as express from 'express';

export class Server {

  private app: express.Application;
  private modelManager: ModelManager;

  public constructor() {
    // Set up Persistence Mechanisms
    this.modelManager = new ModelManager(true);

    // Create expressjs application
    this.app = express();

    // Configure application
    this.config();

    // Add restful routes
    this.addRestRoutes();

    // Finally, listen on port 1919
    this.app.listen(1919);
  }

  private config(): void {
    // Indicate that we'll be using JSON in the bodies of requests and responses
    this.app.use(bodyParser.json());

    // I had to add this to allow javascript served from localhost:3000 to talk to localhost:1919
    // Can't say that I truly understand it
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Wolfe-Authentication-Token");
      res.header("Access-Control-Expose-Headers", "Wolfe-Authentication-Token");
      next();
    });
  }

  private addRestRoutes(): void {
    // Routes to our REST code
    this.app.use('/user', UserRest.getRouter());
    this.app.use('/league', LeagueRest.getRouter());
    this.app.use('/season', SeasonRest.getRouter());
    this.app.use('/', LoginRest.getRouter());
  }

}
