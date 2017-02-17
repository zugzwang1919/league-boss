var UserLogic = require('../logic/user-logic');

module.exports = {
  buildJSONfromMessage: function (message) {
    return { "message": message }
  },
  validateUser: function (req, res, next) {
    var token = req.header('Wolfe-Authentication-Token');
    if (token) {
      UserLogic.findUserByAuthenticationToken(token)
        .then(user => {
          res.append('Wolfe-Authentication-Token', token);
          next();
        })
        .catch(err => {
          console.log("err.name = " + err.name);
          console.log("err.message = " + err.message);
          res.sendStatus(401)
        });
    }
    else {
      res.sendStatus(401);
    }
  }
}