var userModelUtils = require('../model/user');
var User = userModelUtils().definition();

module.exports = function () {
  return {
    findUser: function (userData, callback) {
    },
    createUser: function (userData, callback) {
      console.log("user-logic - createUser has been called.");
      // Ensure all of the required inputs are present
      if (userData.name == null ||
        userData.userName == null ||
        userData.password == null ||
        userData.emailAddress == null) {

        callback(true, "One of the required user attributes is missing.");
        return;
      }
      // Maybe should check to see if the user already exists
      
      
      // If we're here, we should be able to create a user, so...
      // Create the user
      User.create({
        name: userData.name,
        userName: userData.userName,
        password: userData.password,
        emailAddress: userData.emailAddress,
      })
        .then(function () {
          console.log(userData.userName + " was successfully created.");
          callback(null, null);
        });   
    }
  };
}