import 'rxjs/add/operator/switchMap';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params, UrlSegment } from '@angular/router';


import { ServiceResponse } from '../common/service-response';
import { LoginService } from './login.service';
import { CurrentUserService } from '../user/current-user-service.service';
import { User } from '../user/user';

@Component({
  moduleId: module.id,
  templateUrl: 'login.component.html',
})


export class LoginComponent implements OnInit {

  userName: string;
  password: string;
  message: string;


  constructor(
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService
  ) { }


  ngOnInit(): void {

    // Set some defaults immediately
    // We'll only execute this code when the user asks for a new UserDetailComponent to be created.
    // Modifications to the UserDetailComponent are handled in the subscribe() below.
    this.userName = null;
    this.password = null;

    // Handle the request to begin the login or logout process
    this.route.url
      .subscribe((segments: UrlSegment[]) => {
        this.message = null;
        this.userName = null;
        this.password = null;
        console.log("Examining segments in URL within the login.component.  Segments = " + segments);
        if (segments[0].toString() === 'logout') {
          this.logout();
        }
      });

  }

  login(): void {
    console.log("Beginning the process of logging in.");
    this.loginService.login(this.userName, this.password)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from successful login = " + serviceResponse.getMessage());
        this.router.navigate(['/user', this.currentUserService.currentUser.id]);
      })
      .catch((serviceResponse: ServiceResponse) => {
        console.log("Error message received from failed login  = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      });
  }

  logout(): void {
    console.log("Beginning the process of logging out.");
    this.loginService.logout()
      .then(junk => {
        this.userName = null;
        this.password = null;
      })
      .catch((serviceResponse: ServiceResponse) => {
        console.log("Error message received from failed login  = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      });
  }

}
