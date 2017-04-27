var DataModel = require('../model/dataModel');
var User = DataModel.USER;

var LogicErrors = require('./logic-error');



exports.findUserById = function (id) {
  return findUser({ where: { "id": id } });
}

exports.findUserByAuthenticationToken = function (token) {
  return findUser({ where: { "authenticationToken": token } });
}

exports.findUserByUserName = function (userName) {
  return findUser({ where: { "userName": userName } })
}

exports.createUser = function (userData) {
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
    isSuperUser: false,
  })
    .then(user => {
      console.log("user-logic.create() " + userData.userName + " was successfully created.");
      return Promise.resolve(user);
    })
    .catch(err => { return Promise.reject(buildCleanError(err)); })
}

exports.updateUser = function (userId, userData) {
  console.log("user-logic.update() - updateUser has been called.");

  // If we're here, we should be able to update a user, so...
  // Update the user
  return User.update(userData, { where: { id: userId } })
    .then(user => {
      console.log("user-logic.update() " + userData.userName + " was successfully updated.");
      return Promise.resolve(user);
    })
    .catch(err => { return Promise.reject(buildCleanError(err)); })
}

exports.deleteUser = function (userId) {
  console.log("user-logic.delte() - deleteUser has been called.");

  // If we're here, we should be able to delete a user, so...
  // Delete the user
  return User.destroy({ where: { id: userId } })
    .then(numberUsersDeleted => {
      if (numberUsersDeleted === 1) {
        console.log("user-logic.delete() - User with ID of " + userId + " was successfully deleted.");
        return Promise.resolve(true);
      }  
      else {
        console.log("user-logic.delete() - User with ID of " + userId + " was not found.");
        return Promise.reject(LogicErrors.RESOURCE_NOT_FOUND)
      }
    })
    .catch(err => { 
      console.log("user-logic.delete() - Some type of error occurred.  Err message = " + err.message );
      return Promise.reject(buildCleanError(err)); 
    })
}
// A non-Promise based method to be used to test connectivity
exports.getIdentification = function () {
  return '48567';
}



// non-exported (intenral / private) functions

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