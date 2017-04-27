
/* Originally user-logic wanted to use league-logic and vice versa.  This 
   created a circular depenedency.  Given that many, many files will want to use
   user-logic, this file was created to answer league questions about a specific
   user. */



var LeagueLogic = require('./league-logic');
var UserLogic = require('./user-logic');


exports.getLeaguesAsPlayer = function (userId) {
  return UserLogic.findUserById(userId)
    .then(user => {
      return user.getPlayerLeague()
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.getLeaguesAsAdmin = function (userId) {
  return UserLogic.findUserById(userId)
    .then(user => {
      return user.getAdminLeague()
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.isLeagueAdmin = function (userData, leagueId) {
  return LeagueLogic.findLeagueById(leagueId)
    .then(league => {
      return league.hasAdmin(userData.id)
    })
    .catch(err => {
      Promise.reject(buildCleanError(err))
    })
}