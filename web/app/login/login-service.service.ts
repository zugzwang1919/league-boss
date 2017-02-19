import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';

@Injectable()
export class LoginService {

  constructor(
    private http: WolfeHttp,
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
        return Promise.resolve(res.json().message)} )
      .catch((error: Response) => Promise.reject(error.json().message))
  }

}

