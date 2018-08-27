// Rest Layer Classes
import {RestUtil} from './rest-util';

// Logic Layer Classes
import {SeasonLogic} from '../logic/season-logic';

// Model Layer Classes
import {IGameGroupAttribute} from '../model/game-group-model-manager';
import {ISeason} from '../model/season';
import {ISeasonInstance, SeasonModelManager} from '../model/season-model-manager';

import * as Promise from 'bluebird';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';

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

    // GameGroups
    SeasonRest.router.get('/:seasonId/gameGroup', RestUtil.ensureAuthenticated, RestUtil.ensureAuthenticated, SeasonRest.retrieveGameGroups);

    // Add a schedule / games to the season
    SeasonRest.router.post('/:seasonId/schedule', RestUtil.ensureAuthenticated, RestUtil.ensureSuperUser, fileUpload({debug: true}), SeasonRest.addSchedule);

  }

  private static retrieveAllSeasons(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "RETRIEVE ALL SEASONS",
      ((): Promise<ISeasonInstance[]> => SeasonLogic.instanceOf().findAll()),
      ((foundSeasons: ISeasonInstance[]): ISeason[] => foundSeasons.map(SeasonModelManager.createISeasonFromAnything)));
  }

  private static retrieveSeasonById(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "RETRIEVE SEASON",
      ((): Promise<ISeasonInstance> => SeasonLogic.instanceOf().findById(req.params.seasonId)),
      ((lotsOfSeasonInfo: ISeasonInstance): ISeason => SeasonModelManager.createISeasonFromAnything(lotsOfSeasonInfo)));
  }

  private static createSeason(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "CREATE SEASON",
      ((): Promise<ISeasonInstance> => SeasonLogic.instanceOf().create(SeasonModelManager.createISeasonFromAnything(req.body))),
      ((lotsOfSeasonInfo: ISeasonInstance): any => SeasonModelManager.createISeasonFromAnything(lotsOfSeasonInfo)));
  }

  private static updateSeason(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "UPDATE SEASON",
      ((): Promise<boolean> => SeasonLogic.instanceOf().update(SeasonModelManager.createISeasonFromAnything(req.body))));
  }

  private static deleteSeason(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "DELETE SEASON",
      ((): Promise<boolean> => SeasonLogic.instanceOf().deleteById(req.params.seasonId)));
  }

  private static addSchedule(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "ADD SCHEDULE TO SEASON",
      ((): Promise<boolean> => {
        const uploadedFile: fileUpload.UploadedFile = req.files.uploadFile as fileUpload.UploadedFile;
        return SeasonLogic.instanceOf().addSchedule(req.params.seasonId, uploadedFile.data);
      }));
  }

  // Game Groups
  private static retrieveGameGroups(req: express.Request, res: express.Response): void {
    RestUtil.makeLogicRequestAndPackageResult( res, "RETRIEVE SEASON'S GAME GROUPS",
      ((): Promise<IGameGroupAttribute[]> => SeasonLogic.instanceOf().getGameGroups(req.params.seasonId)),
      // Indicate that no transform is required
      // TODO: We probably need a true IGameGroup at some point
      ((lotsOfGameGroupInfo: IGameGroupAttribute[]): any => lotsOfGameGroupInfo));  // Indicate that no transform is required
  }

}

// Initialize all static data
SeasonRest.init();
