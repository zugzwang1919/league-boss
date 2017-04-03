import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { User } from './user';
import { League } from '../league/league';
import { ServiceResponse } from '../common/service-response';


@Injectable()
export class UserService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getUser(id: Number): Promise<User> {
    console.log("Inside UserService: Starting to look for User with an id of " + id);
    return this.http.get('http://localhost:1919/user/' + id)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(this.buildUserFromHttpResponse(res))
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  getUserByName(userName: string): Promise<User> {
    console.log("Inside UserService: Starting to look for User with a name of " + userName);
    return this.http.get('http://localhost:1919/user?name=' + userName)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(this.buildUserFromHttpResponse(res))
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  createUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UserService:  Beginning 'Create User' process");

    return this.http.post('http://localhost:1919/user', user)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(new ServiceResponse(res))
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })
  }

  updateUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UpdateService:  Beginning 'Update User' process");
    return this.http.put('http://localhost:1919/user/' + user.id, user)
      .toPromise()
      .then((res: Response) => {
        var sr: ServiceResponse = new ServiceResponse(res);
        sr.setMessage("The user's profile was successfully updated.")
        return Promise.resolve(sr);
      })
      .catch((res: Response) => {
        return Promise.resolve(new ServiceResponse(res))
      })
  }

  getLeaguesPlayingIn(userId: number): Promise<League[]> {
    console.log("Inside UpdateService:  Beginning 'Retrieving Leagues played in by User' process");
    return this.http.get('http://localhost:1919/user/' + userId + '/leagueAsPlayer')
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })    
  }

  getLeaguesAdministering(userId: number): Promise<League[]> {
    console.log("Inside UpdateService:  Beginning 'Retrieving Leagues administered by User' process");
    return this.http.get('http://localhost:1919/user/' + userId + '/leagueAsAdmin')
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json())
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res))
      })    
  }

  private buildUserFromHttpResponse(res: Response): User {
    if (res.ok === false) {
      console.log("Yuck!  Looks like that did not work.  We were trying to retrieve a user.");
      console.log("We received a status code of " + res.status);
      return new User();
    }
    else {
      console.log("Inside UserService: Successfully found the requested user.");
      var u: User = res.json()
      return u;
    }
  }

  private getMessageFromHttpResponse(res: Response): string {
    console.log("Examining response.  We received " + res);
    console.log("Looking for message in response.  We received:  " + res.json().message);
    return res.json().message;
  }
}