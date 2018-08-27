import {LogicError} from '../logic/logic-error';

import * as express from 'express';

export class RestResponse {

  public static send200(res: express.Response, optionalBody ?: any): void {
    RestResponse.sendResponse(res, 200, optionalBody);
  }

  public static send200WithHeader(res: express.Response, headerKey: string, headerValue: string, optionalBody?: any): void {
    RestResponse.sendResponse(res, 200, optionalBody, { key: headerKey, value: headerValue });
  }

  public static send401(res: express.Response, optionalMessage ?: string): void {
    const message: string = optionalMessage ? optionalMessage : "Authentication failed. Successful login required.";
    const jsonBody: any = RestResponse.buildJSONfromMessage(message);
    RestResponse.sendResponse(res, 401, jsonBody);
  }

  public static send403(res: express.Response): void {
    RestResponse.sendResponse(res, 403, RestResponse.buildJSONfromMessage("Not Authorized."));
  }

  public static sendAppropriateResponse(res: express.Response, error: LogicError): void {
    let statusCode: number;
    switch (error.name) {
      case LogicError.FORBIDDEN.name:
        statusCode = 403;
        break;
      case LogicError.RESOURCE_NOT_FOUND.name:
        statusCode = 404;
        break;
      case LogicError.DUPLICATE.name:
      case LogicError.INCOMPLETE_INPUT.name:
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }
    RestResponse.sendResponse(res, statusCode, RestResponse.buildJSONfromMessage(error.message));
  }

  // Private methods

  private static sendResponse(res: express.Response, statusCode: number, optionalBody ?: any, optionalHeader ?: any): void {
    console.log("REST LAYER: Building a response with a status code of " + statusCode);
    let body: any = RestResponse.buildJSONfromMessage("Success!!!");
    if (optionalBody) {
      console.log("REST LAYER: A body other than 'Success!!!' will be sent.");
      body = optionalBody;
    }
    if (optionalHeader) {
      console.log(`REST LAYER: A header of type ${optionalHeader.key} is being added to the response.`);
      res.header(optionalHeader.key, optionalHeader.value);
    }
    res.status(statusCode).json(body);
  }

  private static buildJSONfromMessage(inputMessage: string): any {
    return { message: inputMessage };
  }

}
