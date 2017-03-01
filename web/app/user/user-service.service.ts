import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { User } from "./user";
import { ServiceResponse } from '../common/service-response';


@Injectable()
export class UserService {

  constructor(
    private http: WolfeHttp,
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

  createUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UserService:  Beginning 'Create User' process");
    return new Promise(resolve => {
      this.http.post('http://localhost:1919/user', user)
        .toPromise()
        .then((res: Response) => resolve(new ServiceResponse(res)))
        .catch((res: Response) => resolve(new ServiceResponse(res))
        )
    })
  }

  updateUser(user: User): Promise<ServiceResponse> {
    console.log("Inside UpdateService:  Beginning 'Update User' process");
    return new Promise(resolve => {
      this.http.put('http://localhost:1919/user/' + user.id, user)
        .toPromise()
        .then((res: Response) => resolve(new ServiceResponse(res)))
        .catch((res: Response) => resolve(new ServiceResponse(res))
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