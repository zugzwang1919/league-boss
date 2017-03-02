var DefineUserFunction = require('./user');
var DefineLeagueFunction = require('./league');
var DefineSeasonFunction = require('./season');

var User = DefineUserFunction();
var League = DefineLeagueFunction();
var Season = DefineSeasonFunction();

User.belongsToMany(League, {as: 'PlayerLeague', through: 'LeaguePlayer' });
League.belongsToMany(User, {as: 'Player', through: 'LeaguePlayer'});
User.belongsToMany(League, {as: 'AdminLeague', through: 'LeagueAdmin' });
League.belongsToMany(User, {as: 'Admin', through: 'LeagueAdmin'});

League.belongsToMany(Season, {through: "LeagueSeason"});


module.exports = {
  "USER": User,
  "LEAGUE": League,
  "SEASON": Season,
}