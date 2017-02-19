import 'rxjs/add/operator/switchMap';

import { Component, Input }       from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { LoginService }  from './login-service.service';


@Component({
  moduleId: module.id,  
  templateUrl: 'login.component.html',
})


export class LoginComponent {

  userName: String;
  password: String;
  message: String;


  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    /*
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
      */      
  }

  login(): void {
    console.log("Beginning the process of logging in.");
    this.loginService.login(this.userName, this.password)
      .then((successMessage: String) => {
        console.log("Message received from successful login = " + successMessage);
        this.message = successMessage;})
      .catch((errorMessage: String) => {
        console.log("Error message received from failed login  = " + errorMessage);
        this.message = errorMessage;        
      })

  }
  

}