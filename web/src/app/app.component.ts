import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './user/user';
import { UserService } from './user/user-service.service';
import { CurrentUserService } from './user/current-user-service.service';

import { ServiceResponse } from './common/service-response';
import { LoginService } from './login/login-service.service';

@Component({
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})

export class AppComponent {
  displayedUserId: string;
  displayedLeagueId: string;

  constructor(
    private router: Router,
    private userService: UserService,
    public currentUserService: CurrentUserService,
    private loginService: LoginService
  ) { }


  ngOnInit(): void {
    this.displayedUserId = "";
    this.displayedLeagueId = "";
  }


  editUserDetails(): void {
    this.router.navigate(['/user', this.displayedUserId]);
  }

  createNew(): void {
    this.router.navigate(['/user/create']);
  }

  loginNow(): void {
    this.router.navigate(['/login']);
  }

  editLeagueDetails(): void {
    this.router.navigate(['/league', this.displayedLeagueId]);
  }

  createNewLeague(): void {
    this.router.navigate(['/league/create']);
  }

  rapidLogin(): void {
    this.loginService.login("RWW", "RWW" )
    .then((serviceResponse: ServiceResponse) => {
      console.log("Message received from successful login = " + serviceResponse.getMessage());
      this.router.navigate(['/user', this.currentUserService.currentUser.id]);
    })
    .catch((serviceResponse: ServiceResponse) => {
      console.log("Error message received from failed login  = " + serviceResponse.getMessage());
      // Shouldn't get here
    });
  }


}
