var UserFunctions = require('./user');
var LeagueFunctions = require('./league');

var User = UserFunctions.definition();
var League = LeagueFunctions.definition();

User.belongsToMany(League, {as: 'PlayerLeague', through: 'LeaguePlayer' });
League.belongsToMany(User, {as: 'Player', through: 'LeaguePlayer'});
User.belongsToMany(League, {as: 'AdminLeague', through: 'LeagueAdmin' });
League.belongsToMany(User, {as: 'Admin', through: 'LeagueAdmin'});



module.exports = {
  "USER": User,
  "LEAGUE": League,
}