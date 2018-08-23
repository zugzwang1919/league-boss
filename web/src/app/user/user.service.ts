import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { User } from './user';
import { League } from '../league/league';
import { ServiceResponse } from '../common/service-response';
import { ServiceUtil } from '../common/service-util';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getUser(id: number): Promise<User> {
    console.log("Inside UserService: Starting to look for User with an id of " + id);
    const getUserUrl: string = ServiceUtil.buildUrl('/user/' + id);
    return this.http.get(getUserUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(this.buildUserFromHttpResponse(res));
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getUserByName(userName: string): Promise<User> {
    console.log("Inside UserService: Starting to look for User with a name of " + userName);
    const getUserByNameUrl: string = ServiceUtil.buildUrl('/user?userName=' + userName);
    return this.http.get(getUserByNameUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(this.buildUserFromHttpResponse(res));
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  createUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UserService:  Beginning 'Create User' process");
    const createUserUrl: string = ServiceUtil.buildUrl('/user');
    return this.http.post(createUserUrl, user)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(new ServiceResponse(res));
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  updateUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UpdateService:  Beginning 'Update User' process");
    const updateUserUrl: string = ServiceUtil.buildUrl('/user/' + user.id);
    return this.http.put(updateUserUrl, user)
      .toPromise()
      .then((res: Response) => {
        const sr: ServiceResponse = new ServiceResponse(res);
        sr.setMessage("The user's profile was successfully updated.");
        return Promise.resolve(sr);
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getLeaguesPlayingIn(userId: number): Promise<League[]> {
    console.log("Inside UpdateService:  Beginning 'Retrieving Leagues played in by User' process");
    const getLeaguesPlayingInUrl: string = ServiceUtil.buildUrl('/user/' + userId + '/leagueAsPlayer');
    return this.http.get(getLeaguesPlayingInUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getLeaguesAdministering(userId: number): Promise<League[]> {
    console.log("Inside UpdateService:  Beginning 'Retrieving Leagues administered by User' process");
    const getLeaguesAdministeringUrl: string = ServiceUtil.buildUrl('/user/' + userId + '/leagueAsAdmin');
    return this.http.get(getLeaguesAdministeringUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  private buildUserFromHttpResponse(res: Response): User {
    if (res.ok === false) {
      console.log("Yuck!  Looks like that did not work.  We were trying to retrieve a user.");
      console.log("We received a status code of " + res.status);
      return new User();
    }
    else {
      console.log("Inside UserService: Successfully found the requested user.");
      const u: User = res.json();
      return u;
    }
  }

  private getMessageFromHttpResponse(res: Response): string {
    console.log("Examining response.  We received " + res);
    console.log("Looking for message in response.  We received:  " + res.json().message);
    return res.json().message;
  }
}
