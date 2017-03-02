
var express = require('express');
var router = express.Router();
var SeasonLogic = require('../logic/season-logic');
var RestUtils = require('./rest-util');
var RestResponse = require('./rest-response');

router.get('/', RestUtils.ensureAuthenticated, function (req, res) {
  console.log("Request received on server!  Looking for all seasons." );
  SeasonLogic.getSeasons()
    .then(seasons => { 
      RestResponse.send200(res, seasons) 
    })
    .catch(error => { 
      RestResponse.sendAppropriateResponse(res, error) 
    })
});


module.exports = router;