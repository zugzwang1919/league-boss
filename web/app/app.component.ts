import { Component }  from '@angular/core';
import { Router }     from '@angular/router';

import { User }       from './user/user';
import { UserService }from './user/user-service.service';
import { CurrentUserService }from './user/current-user-service.service';


@Component({
  selector: 'my-app',
   template: `
    <div style="text-align: center"> 
      <div>
                <p *ngIf=(this.currentUserService.getCurrentUser())> Current User: {{this.currentUserService.getCurrentUser().userName}} </p>
      </div> 
      <div >
        <label> Select a User by Id: </label>
        <input [(ngModel)]="displayedId" placeholder="id"  />
        <button (click)="editDetails()">Edit Details</button>
      <div>
    
      <p>... OR ... </p>
      <br>
      <button (click)="createNew()">Create New User</button>
      <br>
      <p>... OR ... </p>
      <br>      
      <p *ngIf=(this.currentUserService.getCurrentUser())> 
        Current User: {{this.currentUserService.getCurrentUser().userName}} 
        <br>
        Current User Email : {{this.currentUserService.getCurrentUser().emailAddress}}
      </p>
      <button (click)="loginNow()">Go To Login</button>
      <br>
      <hr>
      <br>
    </div>
    
    <router-outlet></router-outlet>
    `
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
