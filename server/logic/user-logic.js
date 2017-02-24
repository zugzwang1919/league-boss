var DataModel = require('../model/dataModel');
var User = DataModel.USER;

var LeagueLogic = require('./league-logic');
var LogicErrors = require('./logic-error');

module.exports = {

  findUserById: function (id) {
    return findUser({ where: { "id": id } });
  },

  findUserByAuthenticationToken: function (token) {
    return findUser({ where: { "authenticationToken": token } });
  },

  findUserByUserName: function (userName) {
    return findUser({ where: { "userName": userName } })
  },

  createUser: function (userData) {
    console.log("user-logic.create() - createUser has been called.");
    // Ensure all of the required inputs are present
    if (!isNewUserValid(userData)) {
      return Promise.reject(buildIncompleteAttributesError());
    }

    // If we're here, we should be able to create a user, so...
    // Create the user
    return User.create({
      userName: userData.userName,
      password: userData.password,
      emailAddress: userData.emailAddress,
    })
      .then(user => {
        console.log("user-logic.create() " + userData.userName + " was successfully created.");
        return Promise.resolve(null);
      })
      .catch(err => { return Promise.reject(buildCleanError(err)); })
  },

  updateUser: function (userData) {
    console.log("user-logic.update() - updateUser has been called.");

    // Ensure all of the required inputs are present
    if (!isExistingUserValid(userData)) {
      return Promise.reject(buildIncompleteAttributesError());
    }

    // If we're here, we should be able to update a user, so...
    // Update the user
    return User.update({
      userName: userData.userName,
      password: userData.password,
      emailAddress: userData.emailAddress,
      authenticationToken: userData.authenticationToken,
      authenticationTokenExpiration: userData.authenticationTokenExpiration
    },
      { where: { id: userData.id } }
    )
      .then(user => {
        console.log("user-logic.update() " + userData.userName + " was successfully updated.");
        return Promise.resolve(user);
      })
      .catch(err => { return Promise.reject(buildCleanError(err)); })
  },

  isSuperUser: function (userData) {
    // for now
    var result;
    if (userData.id === 1)
      result = true;
    else
      result = false;
    console.log("user-logic.isSuperUser - result = " + result);
    return Promise.resolve(result);
  },

  isLeagueAdmin: function (userData, leagueId) {
    var foundLeague
    var foundUser

    return LeagueLogic.findLeagueById(leagueId)
    .then(league => { 
      return league.hasAdmin(userData.id)
    })
    .catch(err => { 
      Promise.reject(buildCleanError(err)) 
    } )
  }
}

function findUser(whereClause) {
  return User.findOne(whereClause)
    .then(user => {
      if (user != null) {
        console.log("user-logic - user found!!!");
        return Promise.resolve(user)
      }
      else {
        console.log("user-logic - user was not found!!!");
        return Promise.reject(LogicErrors.RESOURCE_NOT_FOUND);
      }
    })
    .catch(err => {
      return Promise.reject(buildCleanError(err));
    })
}

function isExistingUserValid(userData) {
  return (userData.id != null &&
    userData.userName != null &&
    userData.password != null &&
    userData.emailAddress != null)
}

function isNewUserValid(userData) {
  return (userData.userName != null &&
    userData.password != null &&
    userData.emailAddress != null)
}


function buildIncompleteAttributesError() {
  console.log("user-logic - Building error indicating that all required attributes were not specified.")
  return LogicErrors.buildError(LogicErrors.INCOMPLETE_INPUT.name, "At least one of the required user attributes is missing.")
}

function buildCleanError(err) {
  var cleanError;
  // Try to clean up expected errors.  
  // We could see the SequelizeUniqueConstraintError when someone tries to create a new user
  // or update an existing user and the desired username is already in existence
  if (err.name === 'SequelizeUniqueConstraintError') {
    console.log("user-logic - Building error indicating that user already exists.")
    cleanError = LogicErrors.buildError(LogicErrors.DUPLICATE.name, "The requested user name already exists.");
  }
  else {
    console.log("user-logic - Cleaning up an unexpected error.")
    cleanError = LogicErrors.firmUpError(err);
  }
  return cleanError;

}