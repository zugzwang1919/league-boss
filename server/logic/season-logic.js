var DataModel = require('../model/dataModel');
var Season = DataModel.SEASON;

var LeagueLogic = require('./league-logic');
var LogicErrors = require('./logic-error');

module.exports = {

  getSeasons: function() {
    return Season.findAll()
    .catch(err => { 
      return Promise.reject(buildCleanError(err)); 
    })

  }
}