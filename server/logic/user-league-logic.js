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