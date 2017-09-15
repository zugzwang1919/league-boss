import {LogicError} from '../logic/logic-error';

import * as express from 'express';

export class RestResponse {

  static send200(res, optionalBody) {
    RestResponse.sendResponse(res, 200, optionalBody, undefined);
  }

  static send200WithHeader(res, headerKey, headerValue, optionalBody) {
    RestResponse.sendResponse(res, 200, optionalBody, { "key": headerKey, "value": headerValue });
  }

  static send401(res, optionalMessage: string) {
    const jsonBody = RestResponse.buildJSONfromMessage(optionalMessage !== undefined ? optionalMessage : "Authentication failed. Successful login required.");
    RestResponse.sendResponse(res, 401, jsonBody, undefined);
  }

  static send403(res) {
    RestResponse.sendResponse(res, 403, RestResponse.buildJSONfromMessage("Not Authorized."), undefined);
  }

  static sendAppropriateResponse(res, error: LogicError) {
    var statusCode;
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
    RestResponse.sendResponse(res, statusCode, RestResponse.buildJSONfromMessage(error.message), undefined);
  }

  // Private methods

  private static sendResponse(res, statusCode: number, optionalBody, optionalHeader) {
    console.log("Building a response with a status code of " + statusCode);
    var body = RestResponse.buildJSONfromMessage("Success!!!");
    if (optionalBody) {
      console.log("A non-default body will be sent.");
      body = optionalBody;
    }
    if (optionalHeader) {
      console.log("A header is being added to the response.");
      res.append(optionalHeader.key, optionalHeader.value);
    }
    res.status(statusCode).json(body);
  }

  private static buildJSONfromMessage(message) {
    return { "message": message };
  }

}