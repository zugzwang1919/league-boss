import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { ServiceResponse } from '../common/service-response';
import { CurrentUserService } from '../user/current-user-service.service';

@Injectable()
export class LoginService {

  constructor(
    private http: WolfeHttp,
    private currentUserService: CurrentUserService,
  ) { }

  login(userName: string, password: string): Promise<Object> {
    console.log("Inside LoginService: Attempting to log in " + userName);
    return this.http.post('http://localhost:1919/login/', { "userName": userName, "password": password })
      .toPromise()
      .then((res: Response) => {
        // Save the login info in our currentUserService
        // Notice that angular has "de-capitalized the name of the header"... Weird
        this.currentUserService.currentUser = res.json().user;
        this.currentUserService.wolfeAuthenticationToken = res.headers.get('wolfe-authentication-token');
        return Promise.resolve(new ServiceResponse(res));
      })
      .catch((error: Response) => {
        return Promise.reject(new ServiceResponse(error))
      });
  }

  logout(): Promise<Object> {
    console.log("Inside LoginService: Attemption to log out")
    return this.http.post('http://localhost:1919/logout/', {})
      .toPromise()
      .then((res: Response) => {
        this.currentUserService.currentUser = null;
        this.currentUserService.wolfeAuthenticationToken = null;
        return Promise.resolve(null);
      })
      .catch((error: Response) => {
        return Promise.reject(new ServiceResponse(error))
      })
  }

}

