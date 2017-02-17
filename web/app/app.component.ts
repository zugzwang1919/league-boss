import { Component }  from '@angular/core';
import { Router }     from '@angular/router';

import { User }       from './user/user';
import { UserService }from './user/user-service.service';


@Component({
  selector: 'my-app',
  template: `
    <div style="text-align: center">  
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
      <button (click)="loginNow()">Login</button>
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
