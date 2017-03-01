import 'rxjs/add/operator/switchMap';

import { Component, Input }       from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { User }         from './user';
import { UserService }  from './user-service.service';
import { ServiceResponse } from '../common/service-response';


@Component({
  moduleId: module.id,  
  templateUrl: 'user-detail.component.html',
})


export class UserDetailComponent {

  user: User;
  action: String;
  message: String;


  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    // Set some defaults immediately
    // We'll only execute this code when the user asks for a new UserDetailComponent to be created.
    // Modifications to the UserDetailComponent are handled in the subscribe() below.
    this.user = new User();
    this.action = 'create';
    
    // Handle the request to begin the "Create", "Edit", (and someday "View") process
    // Based on the subscribe below, we'll constantly monitor changes to the URL 
    this.route.url
      .subscribe((segments: UrlSegment[]) => {
        this.message = null;
        console.log("Examining segments in URL within user-detail.component.  Segments = " + segments);
        if (segments[1].toString() == 'create') {
          this.user = new User();
          this.action = 'create';
        }
        else {
          this.userService.getUser(+segments[1])
            .then(user => {
              this.action = 'edit';
              this.user = user;
              if (user.id == null)
                  this.message = "The specified user could not be found.  Try another Id.";            
              })        
        }
      })      
  }

  createNewUser(): void {
    console.log("Beginning the process of creating a new user.");
    this.userService.createUser(this.user)
      .then((serviceResponse : ServiceResponse) => {
        console.log("Message received from create = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
  }
  
  updateUser(): void {
    console.log("Beginning the process of updating a user.");
    this.userService.updateUser(this.user)
      .then( (serviceResponse : ServiceResponse) => {
        console.log("Message received from update = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
  }

}