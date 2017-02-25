import { Component }  from '@angular/core';
import { Router }     from '@angular/router';

import { User }       from './user/user';
import { UserService }from './user/user-service.service';
import { CurrentUserService }from './user/current-user-service.service';


@Component({
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: 'app.component.html',
})

export class AppComponent { 
  displayedId: String;
  constructor(
    private router: Router,
    private userService: UserService,
    private currentUserService: CurrentUserService
  ){}


  ngOnInit(): void {
    this.displayedId = "";
    
  }

  
  editDetails(): void {
    this.router.navigate(['/user', this.displayedId]);  
  }
  
  createNew(): void {
    this.router.navigate(['/user/create']);  
  }

  loginNow(): void {
    this.router.navigate(['/login']);
  }

  
}
