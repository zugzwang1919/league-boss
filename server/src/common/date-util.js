

exports.createAuthenticationExpirationDate = function () {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMilliseconds(now.getMilliseconds() + (8 * 60 * 60 * 1000));
  console.log("date-util.createAuthenticationExpirationDate - New Authentication Expiration Date = " + expirationDate);
  return expirationDate;
}

exports.anotherFunction = function () {
  return false;
}

