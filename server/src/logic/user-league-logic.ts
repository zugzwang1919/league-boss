
/* Originally user-logic wanted to use league-logic and vice versa.  This 
   created a circular depenedency.  Given that many, many files will want to use
   user-logic, this file was created to answer league questions about a specific
   user. */



// Logic Level Classes
import {UserLogic} from './user-logic';
import {LeagueLogic} from './league-logic';
import {LogicError} from './logic-error';


export class UserLeagueLogic {
  static getLeaguesAsPlayer(userId: number) {
    return UserLogic.findUserById(userId)
      .then(user => {
        return user.getPlayerLeague()
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }

  static getLeaguesAsAdmin(userId: number) {
    return UserLogic.findUserById(userId)
      .then(user => {
        return user.getAdminLeague()
      })
      .catch(err => {
        return Promise.reject(LogicError.firmUpError(err));
      })
  }

  static isLeagueAdmin(userData, leagueId: number): boolean {
    return LeagueLogic.findLeagueById(leagueId)
      .then(league => {
        return league.hasAdmin(userData.id)
      })
      .catch(err => {
        Promise.reject(LogicError.firmUpError(err))
      })
  }
}