var DefineUserFunction = require('./user');
var DefineLeagueFunction = require('./league');

var User = DefineUserFunction();
var League = DefineLeagueFunction();

User.belongsToMany(League, {as: 'PlayerLeague', through: 'LeaguePlayer' });
League.belongsToMany(User, {as: 'Player', through: 'LeaguePlayer'});
User.belongsToMany(League, {as: 'AdminLeague', through: 'LeagueAdmin' });
League.belongsToMany(User, {as: 'Admin', through: 'LeagueAdmin'});



module.exports = {
  "USER": User,
  "LEAGUE": League,
}