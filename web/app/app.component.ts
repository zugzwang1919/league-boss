import { Component }  from '@angular/core';


import { User }       from './user';
import { UserService }from './user-service.service';


@Component({
  selector: 'my-app',
  template: `
    <div *ngIf="displayedId">
      <label> Select a User by Id: </label>
      <input [(ngModel)]="displayedId" placeholder="id" (blur)="setSelectedUserData()" (keyup.enter)="setSelectedUserData()"/>
    <div>
    <my-user-detail [user]="selectedUser"></my-user-detail>
    `
})

export class AppComponent { 
  displayedId: String;
  selectedUser: User;
  users: User[];
  constructor(
    private userService: UserService,
  ){}

  ngOnInit(): void {
    this.userService.getUsers().
      then(users => {
        this.users = users;
        this.userService.getUser(1).then(user => {
            this.selectedUser = user;
            this.displayedId = String(this.selectedUser.id) });
      })
  }

  setSelectedUserData(): void {
    console.log("Looking for user id = " + this.displayedId);
    this.userService.getUser(Number(this.displayedId)).then(user => {
      if (user == null) {
        console.log("user id " + this.displayedId + " was not found.")
        alert("That user could not be found.");
        // reset the displayedId if the specified id could not be found.
        this.displayedId = String(this.selectedUser.id); 
      }  
      else {
        this.selectedUser = user;
        this.displayedId = String(this.selectedUser.id); 
      }
    });
  }

}
