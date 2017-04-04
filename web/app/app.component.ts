import { Component }  from '@angular/core';
import { Router }     from '@angular/router';

import { User }       from './user/user';
import { UserService }from './user/user-service.service';
import { CurrentUserService }from './user/current-user-service.service';


@Component({
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent { 
  displayedUserId: string;
  displayedLeagueId: string;
  leaguueId
  constructor(
    private router: Router,
    private userService: UserService,
    private currentUserService: CurrentUserService
  ){}


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
  
}
