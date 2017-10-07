// Rest Layer Classes
import {RestResponse} from './rest-response';
import {RestUtil} from './rest-util';

// Logic Layer Classes
import {SeasonLogic} from '../logic/season-logic';

// Model Layer Classes
import {ISeason} from '../model/season';
import {ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';

import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as stream from 'stream';

export class SeasonRest {

  private static router: express.Router = express.Router();

  public static getRouter(): express.Router {
    return SeasonRest.router;
  }

  public static init(): void {
    SeasonRest.router.get('/', RestUtil.ensureAuthenticated, SeasonRest.retrieveAllSeasons);
    SeasonRest.router.get('/:seasonId', RestUtil.ensureAuthenticated, SeasonRest.retrieveSeasonById);
    SeasonRest.router.post('/', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, SeasonRest.createSeason);
    SeasonRest.router.put('/:seasonId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, SeasonRest.updateSeason);
    SeasonRest.router.delete('/:seasonId', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, SeasonRest.deleteSeason);

    // Add a schedule / games to the season
    /* RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, */
    SeasonRest.router.post('/:seasonId/schedule', fileUpload({debug: true}), SeasonRest.addSchedule);

  }

  private static retrieveAllSeasons(req: express.Request, res: express.Response): any {
    console.log("Request received on server!  Looking for season with an id of " + req.params.seasonId);
    SeasonLogic.instanceOf().findAll()
      .then((foundSeasons: ISeasonInstance[]) => {
        // Transform the ISeasonInstance to an ISeason (our form that users of our RESTful service should be using)
        const returnSeasons: ISeason[] = foundSeasons.map(SeasonModelManager.createISeasonFromAnything);
        RestResponse.send200(res, returnSeasons);
      })
      .catch((error: any) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static retrieveSeasonById(req: express.Request, res: express.Response): any {
    console.log("Request received on server!  Looking for season with an id of " + req.params.seasonId);
    SeasonLogic.instanceOf().findById(req.params.seasonId)
      .then((foundSeason: ISeasonInstance) => {
        // Transform the ISeasonInstance to an ISeason (our form that users of our RESTful service should be using)
        const returnSeason: ISeason = SeasonModelManager.createISeasonFromAnything(foundSeason);
        RestResponse.send200(res, returnSeason);
      })
      .catch((error: any) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static createSeason(req: express.Request, res: express.Response): any {

    console.log("season-rest createSeason: seasonName found in body = " + req.body.seasonName);
    const seasonData: ISeason = SeasonModelManager.createISeasonFromAnything(req.body);
    return SeasonLogic.instanceOf().create(seasonData)
      .then((createdSeason: ISeasonInstance) => {
        // Transform the ISeasonInstance to an ISeason (our form that users of our RESTful service should be using)
        const returnSeason: ISeason = SeasonModelManager.createISeasonFromAnything(createdSeason);
        RestResponse.send200(res, returnSeason);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });

  }

  private static updateSeason(req: express.Request, res: express.Response): any {
    console.log("season-rest updateSeason: seasonName found in body = " + req.body.seasonName);
    // Transform the ISeasonInstance to an ISeason (our form that users of our RESTful service should be using)
    const seasonData: ISeason = SeasonModelManager.createISeasonFromAnything(req.body);
    SeasonLogic.instanceOf().update(seasonData)
      .then((success) => {
        RestResponse.send200(res);
      })
      .catch((error) => {
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static deleteSeason(req: express.Request, res: express.Response): any {
    console.log("season-rest deleteSeason: seasonId found in url = " + req.params.seasonId);
    SeasonLogic.instanceOf().deleteById(req.params.seasonId)
      .then((success) => {
        console.log("season-rest deleteSeason: successful delete for season id " + req.params.seasonId + " has occurred.");
        RestResponse.send200(res);
      })
      .catch((error) => {
        console.log("season-rest deleteSeason: an error occurred while deleting season id  " + req.params.seasonId);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  private static addSchedule(req: express.Request, res: express.Response): any {
    console.log("season-rest addSchedule: seasonId found in url = " + req.params.seasonId);
    const uploadedFile: fileUpload.UploadedFile = req.files.uploadFile as fileUpload.UploadedFile;
    SeasonLogic.instanceOf().addSchedule(req.params.seasonId, uploadedFile.data)
    .then((success) => {
      console.log("season-rest addSchedule: schedule successfully added for season id " + req.params.seasonId );
      RestResponse.send200(res);
    })
    .catch((error) => {
      console.log("season-rest addSchedule: an error occurred while adding a schedule for season id  " );
      RestResponse.sendAppropriateResponse(res, error);
    });
  }

  private static buildOneGame(oneGame: string[]): void {
    return;
  }

}

// Initialize all static data
SeasonRest.init();
