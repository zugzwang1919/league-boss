import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';
import { Response }   from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User }       from "./user";
import { USERS }      from './mock-users';

@Injectable()
export class UserService {

  constructor(
    private http: Http,
  ){}

  getUsers(): Promise<User[]> {
   return Promise.resolve(USERS);
  }   
  getUsersSlowly(): Promise<User[]> {
    return new Promise(resolve => {
      // Simulate server latency with 5 second delay
      setTimeout(() => resolve(this.getUsers()), 5000);
      });
  }
  getUser(id: Number): Promise<User> {
    console.log("Looking for User with an id of " + id);
    //return Promise.resolve(this.buildUserFromHttpResponse(undefined));
    
    return new Promise( resolve => {
      this.http.get('http://localhost:1919/user/' + id)
      .toPromise()
      .then((res: Response) => resolve(this.buildUserFromHttpResponse(id, res)))
      .catch((error: Response) => resolve(null))
    })
      
  } 

  private buildUserFromHttpResponse(id: Number, res: Response): User {
    if (res.ok === false) {
      console.log("Yuck!  Looks like that did not work.  We were trying to retrieve a user id of " + id);
      console.log("We received a status code of " + res.status);
      return null;
    }
    else {
      console.log("Successfully found user id " + id);
      var u: User = res.json()
      return u;
    }
    
  }
}