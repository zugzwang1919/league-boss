import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User } from "./user";
import { USERS } from './mock-users';

@Injectable()
export class UserService {

  constructor(
    private http: Http,
  ) { }

  getUser(id: Number): Promise<User> {
    console.log("Inside UserService: Starting to look for User with an id of " + id);
    //return Promise.resolve(this.buildUserFromHttpResponse(undefined));

    return new Promise(resolve => {
      this.http.get('http://localhost:1919/user/' + id)
        .toPromise()
        .then((res: Response) => resolve(this.buildUserFromHttpResponse(id, res)))
        .catch((error: Response) => resolve(new User()))
    })
  }

  createUser(user: User): Promise<String> {
    console.log("Inside UserService:  Beginning 'Create User' process");
    return new Promise(resolve => {
      this.http.post('http://localhost:1919/user/create', user)
        .toPromise()
        .then((res: Response) => resolve(this.getMessageFromHttpResponse(res)))
        .catch((error: Response) => resolve(this.getMessageFromHttpResponse(error))
        )
    })
  }

  updateUser(user: User): Promise<String> {
    console.log("Inside UpdateService:  Beginning 'Update User' process");
    return new Promise(resolve => {
      this.http.put('http://localhost:1919/user/' + user.id, user)
        .toPromise()
        .then((res: Response) => resolve(this.getMessageFromHttpResponse(res)))
        .catch((error: Response) => resolve(this.getMessageFromHttpResponse(error))
        )
    })
  }

  private buildUserFromHttpResponse(id: Number, res: Response): User {
    if (res.ok === false) {
      console.log("Yuck!  Looks like that did not work.  We were trying to retrieve a user id of " + id);
      console.log("We received a status code of " + res.status);
      return new User();
    }
    else {
      console.log("Inside UserService: Successfully found user id " + id);
      var u: User = res.json()
      return u;
    }
  }

  private getMessageFromHttpResponse(res: Response): String {
    console.log("Examining response.  We received " + res);
    console.log("Looking for message in response.  We received:  " + res.json().message);
    return res.json().message;
  }
}