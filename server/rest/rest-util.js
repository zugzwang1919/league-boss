module.exports = function(){
  return {
    buildJSONfromMessage : function(message ) {
        return { "message" : message }
    },
    validateUser : function(req, res, next) {
      var token = req.header('Wolfe-Authentication-Token');
      if (token) {
        res.append('Wolfe-Authentication-Token', token);
        next();
      }
      else {
        res.send(401);  
      }
    }
  }
}