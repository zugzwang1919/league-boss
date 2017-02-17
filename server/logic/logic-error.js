module.exports = {
  RESOURCE_NOT_FOUND  : {name: "Resource not found.", message: "The specified resource was not found."},
  LOGIN_FAILED        : {name: "Login failed.",       message: "The ID / Password combination is not valid"}, 
  FORBIDDEN           : {name: "Forbidden",           message: "You do not have the authority to access the specified resource."},
  INCOMPLETE_INPUT    : {name: "Incomplete",          message: "There was not enough data provided to fulfill the request."},
  DUPLICATE           : {name: "Duplicate",           message: "This entity already exisits."},
  UNKNOWN             : {name: "Unknown",             message: "An unknown error occurred."},

  buildError: function(name, message) {
    return {"name" : name, "message" : message}
  },

  buildGenericMessage: function(err) {
    var genericMessage = "An error has occurred.  No details are available.";
    if (err != null && err.name != null && err.message != null )
      genericMessage = "An error has occurred.  Type: " + err.name + "  Detail: " + message; 
    return genericMessage;
  }, 

  firmUpError: function(err) {
    var name = this.UNKNOWN.name;
    var message = this.UNKNOWN.message;
    if (err != null) {
      if (err.name != null)
        name = err.name;
      if (err.message != null)
        message = err.message;
    }
    return {"name" : name, "message" : message}
  }

};