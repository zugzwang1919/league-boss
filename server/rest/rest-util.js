module.exports = {
  buildJSONfromMessage: function (message) {
    return { "message": message }
  },
  validateUser: function (req, res, next) {
    var token = req.header('Wolfe-Authentication-Token');
    if (token) {
      res.append('Wolfe-Authentication-Token', token);
      next();
    }
    else {
      res.sendStatus(401);
    }
  }
}