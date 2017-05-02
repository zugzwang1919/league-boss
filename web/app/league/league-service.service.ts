import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { League } from './league';
import { User } from '../user/user';
import { ServiceResponse } from '../common/service-response';




@Injectable()
export class LeagueService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getLeague(id: number): Promise<League> {
    console.log("Inside LeagueService: Starting to look for League with an id of " + id);

    return this.http.get('http://localhost:1919/league/' + id)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  createLeague(league: League): Promise<League> {
    console.log("Inside LeagueService:  Beginning 'Create League' process");
    return this.http.post('http://localhost:1919/league', league)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  updateLeague(league: League): Promise<ServiceResponse> {
    console.log("Inside LeagueService:  Beginning 'Update League' process");
    return this.http.put('http://localhost:1919/league/' + league.id, league)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(new ServiceResponse(res))
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  getAdmins(leagueId: number): Promise<User[]> {
    console.log("Inside LeagueService: Looking for admins for league id = " + leagueId);
    return this.http.get('http://localhost:1919/league/' + leagueId + '/admin')
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  addAdmin(leagueId: number, userId: number) {
    console.log("Inside LeagueService: Looking to add user id = " + userId + " into  league id = " + leagueId + " as an admin.");
    return this.http.post('http://localhost:1919/league/' + leagueId + '/admin', { "userId": userId })
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })

  }

  removeAdmin(leagueId: number, userId: number) : Promise<boolean> {
    console.log("Inside LeagueService: Looking to remove user id = " + userId + " from  league id = " + leagueId + " as an admin.");
    return this.http.delete('http://localhost:1919/league/' + leagueId + '/admin/' + userId)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(true);
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  getPlayers(leagueId: number): Promise<User[]> {
    console.log("Inside LeagueService: Looking for players for league id = " + leagueId);
    return this.http.get('http://localhost:1919/league/' + leagueId + '/player')
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  addPlayer(leagueId: number, userId: number) {
    console.log("Inside LeagueService: Looking to add user id = " + userId + " into  league id = " + leagueId + "as a player.");
    return this.http.post('http://localhost:1919/league/' + leagueId + '/player', { "userId": userId })
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }


  removePlayer(leagueId: number, userId: number) : Promise<boolean> {
    console.log("Inside LeagueService: Looking to remove user id = " + userId + " from  league id = " + leagueId + " as an admin.");
    return this.http.delete('http://localhost:1919/league/' + leagueId + '/player/' + userId)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(true);
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }


}