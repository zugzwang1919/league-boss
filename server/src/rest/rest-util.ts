import * as Promise from 'bluebird';
import * as express from 'express';

// Rest Layer Classes
import {RestResponse} from './rest-response';

// Logic Layer Classes
import {UserLogic} from '../logic/user-logic';

// Model Layer Classes
import {IUserInstance} from '../model/user-model-manager';

// Common Classes
import {DateUtil} from '../common/date-util';

export class RestUtil {

  public static ensureAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const token: string = req.header('Wolfe-Authentication-Token');
    if (token) {
      UserLogic.instanceOf().findUserByAuthenticationToken(token)
        // User found
        .then((user: IUserInstance) => {
          // If the session hasn't timed out...
          if (user.authenticationTokenExpiration.valueOf() > Date.now()) {
            // Bump the expiration date
            return UserLogic.instanceOf().update({ id: user.id, authenticationTokenExpiration: DateUtil.createAuthenticationExpirationDate() });
          }
          // Session timed out
          else {
            return Promise.reject({ name: "SESSION_TIMEOUT", message: "Session timed out." });
          }
        })
        // Update went OK
        .then((user) => {
          res.header('Wolfe-Authentication-Token', token);
          next();
        })
        // Something went wrong
        .catch((err) => {
          console.log("err.name = " + err.name);
          console.log("err.message = " + err.message);
          RestResponse.send401(res);
        });
    }
    else {
      RestResponse.send401(res);
    }
  }

  public static ensureSuperUser(req: express.Request, res: express.Response, next: express.NextFunction): any {
    // Get the user associated with the token
    UserLogic.instanceOf().findUserByAuthenticationToken(req.header('Wolfe-Authentication-Token'))
      .then((foundUser) => {
        // If this is a superuser, we're good to go (call next())
        if (foundUser.isSuperUser) {
          next();
        }
        // Otherwise, reject the request
        else {
          return Promise.reject({ name: "NOT_SUPER_USER", message: "The current user is not a super user." });
        }
      })
      .catch((error) => {
        // If anything goes wrong, we're sending back a 403
        RestResponse.send403(res);
      });
  }
  /**
   * This is a basic function that keeps every REST call from writing the same pile of code over
   * and over again.  The function's goal is to make a call to the logic layer and then optionally transform that object into another
   * object AND place that transformed object in the Body of the Response.
   *
   * @param res The Express Response that will be sent to the RESTful API User
   * @param actionToLog A simple string that will be used in logging
   * @param logicFunction The function provided by the caller that actually interacts with the Logic Layer
   *          This function must return the Promise of an Object
   * @param optionalBodyTransformFunction This has two purposes:
   *          1) If provided indicates that the caller wants this method to populate the body of the response
   *          2) When provided it will be called to transform the object returned by the logicFunction to something suitable for the RESTful API User
   */
  public static makeLogicLayerRequest(res: express.Response,
                                      actionToLog: string,
                                      logicFunction: (() => Promise<any>),
                                      optionalBodyTransformFunction?: (logicResult: any) => any ): void {
    console.log(`REST LAYER: Starting to ${actionToLog}`);
    logicFunction()
      .then((returnedValue: any) => {
        const bodyValue: any = optionalBodyTransformFunction ? optionalBodyTransformFunction(returnedValue) : undefined;
        console.log(`REST LAYER: ${actionToLog} was successful.`);
        RestResponse.send200(res, bodyValue);
      })
      .catch((error: any) => {
        console.log(`REST LAYER: ${actionToLog} failed. ${error.name} - ${error.message}`);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

  /**
   * This is a basic function that keeps every REST call from writing the same pile of code over
   * and over again.  The function's goal is to make a call to the logic layer, transform that object into another
   * object, and then place that transformed object in the Body of the Response.
   *
   * @param res The Express Response that will be sent to the RESTful API User
   * @param actionToLog A simple string that will be used in logging
   * @param logicFunction The function provided by the caller that actually interacts with the Logic Layer
   *          This function must return the Promise of an Object
   * @param bodyTransformFunction This function should transform the value returned by the logicFunction()
   *          and return a Promise of the body that is to be placed in the response.
   */
  public static makeLogicLayerRequestWithPromiseBasedTransform(res: express.Response,
                                                               actionToLog: string,
                                                               logicFunction: (() => Promise<any>),
                                                               bodyTransformFunction: (logicResult: any) => Promise<any> ): void {
    console.log(`REST LAYER: Starting to ${actionToLog}`);
    logicFunction()
      .then((returnedValue: any) => {
        return bodyTransformFunction(returnedValue);
      })
      .then((transformedBody: any) => {
        console.log(`REST LAYER: ${actionToLog} was successful.`);
        RestResponse.send200(res, transformedBody);
      })
      .catch((error: any) => {
        console.log(`REST LAYER: ${actionToLog} failed. ${error.name} - ${error.message}`);
        RestResponse.sendAppropriateResponse(res, error);
      });
  }

}
