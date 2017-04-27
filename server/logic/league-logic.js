var DataModel = require('../model/dataModel');
var League = DataModel.LEAGUE;
var LogicErrors = require('./logic-error');
var UserLogic = require('./user-logic');
console.log("inside league-logic, User Logic ID = " + UserLogic.getIdentification());


exports.findLeagueById = function (id) {
  return findLeague({ where: { "id": id } });
}

exports.createLeague = function (leagueData, creatingUserId) {
  console.log("league-logic.create() - createLeague has been called.");
  // Ensure all of the required inputs are present
  if (!isNewLeagueValid(leagueData)) {
    return Promise.reject(buildIncompleteAttributesError());
  }

  var leagueToReturn;

  // If we're here, we should be able to create a league, so...
  // Create the league
  return League.create({
    leagueName: leagueData.leagueName,
    description: leagueData.description,
    seasonTypeIndex: leagueData.seasonTypeIndex,
    leagueTypeIndex: leagueData.leagueTypeIndex
  })

    .then(league => {
      console.log("league-logic.create() " + leagueData.leagueName + " was successfully created.");
      console.log("league-logic.create() - Preparing to add admin");
      leagueToReturn = league;
      return league.addAdmin(creatingUserId.userId)
    })
    .then(stuff => {
      return Promise.resolve(leagueToReturn)
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.updateLeague = function (leagueData) {
  console.log("league-logic.update() - updateLeague has been called.");

  // Ensure all of the required inputs are present
  if (!isExistingLeagueValid(leagueData)) {
    return Promise.reject(buildIncompleteAttributesError());
  }

  // If we're here, we should be able to update a league, so...
  // Update the league
  return League.update({
    leagueName: leagueData.leagueName,
    description: leagueData.description,
    seasonTypeIndex: leagueData.seasonTypeIndex,
    leagueTypeIndex: leagueData.leagueTypeIndex
  },
    { where: { id: leagueData.id } }
  )
    .then(result => {
      console.log("league-logic.update() " + leagueData.leagueName + " was successfully updated.");
      return Promise.resolve(null);
    })
    .catch(err => { return Promise.reject(LogicErrors.firmUpError(err)); })
}

exports.getAdmins = function (leagueId) {
  return this.findLeagueById(leagueId)
    .then(league => {
      return league.getAdmin()
    })
    .catch(err => { return Promise.reject(LogicErrors.firmUpError(err)); })
}

exports.addAdmin = function (leagueId, userId) {
  var foundLeague;
  var UserLogic = require('./user-logic');
  return UserLogic.findUserById(userId)
    .then(user => {
      return this.findLeagueById(leagueId)
    })
    .then(league => {
      foundLeague = league;
      return foundLeague.hasAdmin(userId)
    })
    .then(leagueAlreadyHasAdmin => {
      if (leagueAlreadyHasAdmin)
        return Promise.reject(LogicErrors.DUPLICATE);
      else
        return foundLeague.addAdmin(userId);
    })
    .then(newLeagueAdmin => {
      return true;
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.removeAdmin = function (leagueId, userId) {
  return this.findLeagueById(leagueId)
    .then(league => {
      return league.removeAdmin(userId)
    })
    .then(numAdminsRemoved => {
      if (numAdminsRemoved === 1) {
        return true;
      }
      else {
        return Promise.reject(LogicErrors.RESOURCE_NOT_FOUND);
      }
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.getPlayers = function (leagueId) {
  return this.findLeagueById(leagueId)
    .then(league => {
      return league.getPlayer()
    })
    .catch(err => { return Promise.reject(LogicErrors.firmUpError(err)); })
}

exports.addPlayer = function (leagueId, userId) {
  var foundLeague;
  var UserLogic = require('./user-logic.js');
  return UserLogic.findUserById(userId)
    .then(user => {
      return this.findLeagueById(leagueId)
    })
    .then(league => {
      foundLeague = league;
      return foundLeague.hasPlayer(userId)
    })
    .then(playerAlreadyInLeague => {
      if (playerAlreadyInLeague)
        return Promise.reject(LogicErrors.DUPLICATE);
      else
        return foundLeague.addPlayer(userId);
    })
    .then(wasPlayerAddedToLeague => {
      return true;
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

exports.removePlayer = function (leagueId, userId) {
  return this.findLeagueById(leagueId)
    .then(league => {
      return league.removePlayer(userId)
    })
    .then(numPlayersRemoved => {
      if (numPlayersRemoved === 1) {
        return true;
      }
      else {
        return Promise.reject(LogicErrors.RESOURCE_NOT_FOUND);
      }
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}

// Non-exported functions (private / local functions)

function findLeague(whereClause) {
  return League.findOne(whereClause)
    .then(league => {
      if (league != null) {
        console.log("league-logic - league found!!!");
        return Promise.resolve(league)
      }
      else {
        console.log("league-logic - league was not found!!!");
        return Promise.reject(LogicErrors.RESOURCE_NOT_FOUND);
      }
    })
    .catch(err => {
      return Promise.reject(LogicErrors.firmUpError(err));
    })
}


function isNewLeagueValid(leagueData) {
  return (leagueData.leagueName != null &&
    leagueData.description != null)
}


function isExistingLeagueValid(leagueData) {
  return (leagueData.id != null &&
    leagueData.leagueName != null &&
    leagueData.description != null)
}


function buildIncompleteAttributesError() {
  console.log("league-logic - Building error indicating that all required attributes were not specified.")
  return LogicErrors.buildError(LogicErrors.INCOMPLETE_INPUT.name, "At least one of the required league attributes is missing.")
}

