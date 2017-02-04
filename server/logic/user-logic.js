var userModelUtils = require('../model/user');
var User = userModelUtils().definition();

module.exports = function () {
  return {
    findUser: function (userData, callback) {
    },
    createUser: function (userData, callback) {
      console.log("user-logic.create() - createUser has been called.");
      // Ensure all of the required inputs are present
      if (!isUserValid(userData)) {
        callback(true, "At least one of the required user attributes is missing.");
        return;
      }

      // If we're here, we should be able to create a user, so...
      // Create the user
      User.create({
        userName: userData.userName,
        password: userData.password,
        emailAddress: userData.emailAddress,
      })
        .then(user => {
          console.log("user-logic.create() " + userData.userName + " was successfully created.");
          callback(null, null);
        })
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("user-logic.create() - " + errorMessage);
          if (err.name === 'SequelizeUniqueConstraintError')
            errorMessage = "The requested user name already exists."

          callback(true, errorMessage);
        })
    },
    updateUser: function (userData, callback) {
      console.log("user-logic.update() - updateUser has been called.");

      // Ensure all of the required inputs are present
      if (!isUserValid(userData)) {
        callback(true, "At least one of the required user attributes is missing.");
        return;
      }

      // If we're here, we should be able to create a user, so...
      // Create the user
      User.update(
        {
          userName: userData.userName,
          password: userData.password,
          emailAddress: userData.emailAddress,
        },
        { where: { id: userData.id } }
      )
        .then(result => {
          console.log("user-logic.update() " + userData.userName + " was successfully updated.");
          callback(null, null);
        })
        .catch(err => {
          var errorMessage = "A Sequelize error has occurred.  Error Name: " + err.name + ".  Error Message: " + err.message;
          console.log("user-logic.create() - " + errorMessage);
          if (err.name === 'SequelizeUniqueConstraintError')
            errorMessage = "The requested user name already exists."
          callback(true, errorMessage);
        })
    }
  };

  function isUserValid(userData) {
    return (userData.userName != null &&
      userData.password != null &&
      userData.emailAddress != null)
  }
}