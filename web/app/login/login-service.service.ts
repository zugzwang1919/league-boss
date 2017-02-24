import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { CurrentUserService } from '../user/current-user-service.service';

@Injectable()
export class LoginService {

  constructor(
    private http: WolfeHttp,
    private currentUserService: CurrentUserService,

  ) { }

  login(userName: String, password: String): Promise<Object> {
    console.log("Inside LoginService: Attempting to log in " + userName);
    return this.http.post('http://localhost:1919/login/', { "userName": userName, "password": password })
      .toPromise()
      .then((res: Response) => {
        // Set the authorization token in local storage where subesequent calls can access it
        // Notice that angular has "de-capitalized the name of the header"... Weird
        var token: string = res.headers.get('wolfe-authentication-token');
        localStorage.setItem('Wolfe-Authentication-Token', token);
        this.currentUserService.setCurrentUser(res.json().user);
        return Promise.resolve(res.json().message)} )
      .catch((error: Response) => Promise.reject(error.json().message))
  }

}

