import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { League } from './league';
import { User } from '../user/user';
import { ServiceResponse } from '../common/service-response';
import { ServiceUtil } from '../common/service-util';



@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getLeague(id: number): Promise<League> {
    console.log("Inside LeagueService: Starting to look for League with an id of " + id);
    const getUrl: string = ServiceUtil.buildUrl('/league/' + id);
    return this.http.get(getUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  createLeague(league: League): Promise<League> {
    console.log("Inside LeagueService:  Beginning 'Create League' process");
    const postUrl: string = ServiceUtil.buildUrl('/league');
    return this.http.post(postUrl, league)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  updateLeague(league: League): Promise<ServiceResponse> {
    console.log("Inside LeagueService:  Beginning 'Update League' process");
    const putUrl: string = ServiceUtil.buildUrl('/league/' + league.id);
    return this.http.put(putUrl, league)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(new ServiceResponse(res));
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getAdmins(leagueId: number): Promise<User[]> {
    console.log("Inside LeagueService: Looking for admins for league id = " + leagueId);
    const getAdminsUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/admin');
    return this.http.get(getAdminsUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  addAdmin(leagueId: number, userId: number) {
    console.log("Inside LeagueService: Looking to add user id = " + userId + " into  league id = " + leagueId + " as an admin.");
    const addAdminUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/admin');
    return this.http.post(addAdminUrl, { "userId": userId })
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });

  }

  removeAdmin(leagueId: number, userId: number): Promise<boolean> {
    console.log("Inside LeagueService: Looking to remove user id = " + userId + " from  league id = " + leagueId + " as an admin.");
    const removeAdminUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/admin/' + userId);
    return this.http.delete(removeAdminUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(true);
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getPlayers(leagueId: number): Promise<User[]> {
    console.log("Inside LeagueService: Looking for players for league id = " + leagueId);
    const getPlayersUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/player');
    return this.http.get(getPlayersUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  addPlayer(leagueId: number, userId: number) {
    console.log("Inside LeagueService: Looking to add user id = " + userId + " into  league id = " + leagueId + "as a player.");
    const addPlayerUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/player');
    return this.http.post(addPlayerUrl, { "userId": userId })
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }


  removePlayer(leagueId: number, userId: number): Promise<boolean> {
    console.log("Inside LeagueService: Looking to remove user id = " + userId + " from  league id = " + leagueId + " as an admin.");
    const removePlayerUrl: string = ServiceUtil.buildUrl('/league/' + leagueId + '/player/' + userId);
    return this.http.delete(removePlayerUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(true);
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

}
