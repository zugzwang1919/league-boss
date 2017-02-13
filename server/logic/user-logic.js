var userModelUtils = require('../model/user');
var User = userModelUtils().definition();

module.exports = function () {
  return {
    findUser: function (userData, callback) {
    },
    createUser: function (userData) {
      console.log("user-logic.create() - createUser has been called.");
      // Ensure all of the required inputs are present
      if (!isUserValid(userData)) {
        return Promise.reject("At least one of the required user attributes is missing.");
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
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("user-logic.create() - " + errorMessage);
          if (err.name === 'SequelizeUniqueConstraintError')
            errorMessage = "The requested user name already exists."
          return Promise.reject(errorMessage);
        })
    },
    updateUser: function (userData) {
      console.log("user-logic.update() - updateUser has been called.");

      // Ensure all of the required inputs are present
      if (!isUserValid(userData)) {
        return Promise.reject("At least one of the required user attributes is missing.");
      }

      // If we're here, we should be able to update a user, so...
      // Update the user
      return User.update( {
          userName: userData.userName,
          password: userData.password,
          emailAddress: userData.emailAddress,
          authenticationToken: userData.authenticationToken,
        },
        { where: { id: userData.id } }
      )
        .then(result => {
          console.log("user-logic.update() " + userData.userName + " was successfully updated.");
          return Promise.resolve(null);
        })
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("user-logic.create() - " + errorMessage);
          if (err.name === 'SequelizeUniqueConstraintError')
            errorMessage = "The requested user name already exists."
          return Promise.reject(errorMessage);
        })
    }
  };

  function isUserValid(userData) {
    return (userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null)
  }
}