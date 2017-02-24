var LogicErrors = require('../logic/logic-error');

module.exports = {

  send200: function(res, optionalBody) {
    sendResponse(res, 200, optionalBody);
  },
  
  send200WithHeader: function(res, headerKey, headerValue, optionalBody) {
    sendResponse(res, 200, optionalBody, {"key" : headerKey, "value" : headerValue });
  },  
    
  send401: function(res) {
    sendResponse(res, 401, buildJSONfromMessage("Authentication failed."))
  },

  send403: function(res) {
    sendResponse(res, 403, buildJSONfromMessage("Not Authorized."))
  },

  sendAppropriateResponse: function(res, error) {
    var statusCode;
    switch (error.name) {
      case LogicErrors.RESOURCE_NOT_FOUND.name:
        statusCode = 404;
        break;
      case LogicErrors.DUPLICATE.name:
      case LogicErrors.INCOMPLETE_INPUT.name:
        statusCode = 400;
        break;
      default: 
        statusCode = 500; 
    }
    sendResponse(res, statusCode, buildJSONfromMessage(error.message));
  }

}


function sendResponse(res, statusCode, optionalBody, optionalHeader) {
  console.log("Building a response with a status code of " + statusCode);
  var body = buildJSONfromMessage("Success!!!");
  if (optionalBody != null) {
    console.log("A non-default body will be sent.");
    body = optionalBody;
  }  
  if (optionalHeader != null) {
    console.log("A header is being added to the response.");
    res.append(optionalHeader.key, optionalHeader.value);  
  }
  res.status(statusCode).json(body);
}

function buildJSONfromMessage(message) {
  return { "message": message };
}
