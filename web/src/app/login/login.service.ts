import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { ServiceResponse } from '../common/service-response';
import { ServiceUtil } from '../common/service-util';
import { CurrentUserService } from '../user/current-user-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: WolfeHttp,
    private currentUserService: CurrentUserService,
  ) { }

  login(userName: string, password: string): Promise<Object> {
    console.log("Inside LoginService: Attempting to log in " + userName);
    const loginUrl: string = ServiceUtil.buildUrl("/login/");
    return this.http.post(loginUrl, { "userName": userName, "password": password })
      .toPromise()
      .then((res: Response) => {
        // Save the login info in our currentUserService
        // Notice that angular has "de-capitalized the name of the header"... Weird
        this.currentUserService.currentUser = res.json();
        this.currentUserService.wolfeAuthenticationToken = res.headers.get('wolfe-authentication-token');
        return Promise.resolve(new ServiceResponse(res));
      })
      .catch((error: Response) => {
        return Promise.reject(new ServiceResponse(error));
      });
  }

  logout(): Promise<Object> {
    console.log("Inside LoginService: Attemption to log out");
    const logoutUrl: string = ServiceUtil.buildUrl("/logout/");
    return this.http.post(logoutUrl, {})
      .toPromise()
      .then((res: Response) => {
        this.currentUserService.currentUser = null;
        this.currentUserService.wolfeAuthenticationToken = null;
        return Promise.resolve(null);
      })
      .catch((error: Response) => {
        return Promise.reject(new ServiceResponse(error));
      });
  }

}

