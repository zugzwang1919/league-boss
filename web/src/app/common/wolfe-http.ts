import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { CurrentUserService } from '../user/current-user-service.service';

@Injectable()
export class WolfeHttp {

  constructor(
    private http: Http,
    private currentUserService: CurrentUserService,
  ) { }

  createAppropriateHeaders(): Headers {
    const headers = new Headers();
    // I thought that I would need to add headers like "Content-Type" and "Accept", but it looks like
    // AngularJS's http implementation is doing all of tha for me.  If I need to add those
    // type of headers, this is the place to do it.

    // If the user has logged in, add the authorization headers
    const token: string = this.currentUserService.wolfeAuthenticationToken;
    if (token != null) {
      headers.append('Wolfe-Authentication-Token', token);
    }
    return headers;
  }

  get(url) {
    const headers = new Headers();
    return this.http.get(url, {
      headers: this.createAppropriateHeaders()
    });
  }

  post(url, data) {
    const headers = new Headers();
    return this.http.post(url, data, {
      headers: this.createAppropriateHeaders()
    });
  }

  put(url, data) {
    const headers = new Headers();
    return this.http.put(url, data, {
      headers: this.createAppropriateHeaders()
    });
  }

  delete(url) {
    const headers = new Headers();
    return this.http.delete(url,  {
      headers: this.createAppropriateHeaders()
    });
  }

}
