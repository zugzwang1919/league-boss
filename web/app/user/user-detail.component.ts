import 'rxjs/add/operator/switchMap';

import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';
import {FormsModule, NgForm, FormGroup } from '@angular/forms'

import { User } from './user';
import { League } from '../league/league';
import { UserService } from './user-service.service';
import { CurrentUserService } from './current-user-service.service';
import { ServiceResponse } from '../common/service-response';

import { StringUtil } from '../common/string-util';


@Component({
  moduleId: module.id,
  templateUrl: 'user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})


export class UserDetailComponent {

  // Referential info
  leagueType: Object[] = require('../../interface/league-type.js');
  seasonType: Object[] = require('../../interface/season-type.js');


  user: User;
  confirmPassword: string;
  leaguesAsAdmin: League[];
  leaguesAsPlayer: League[];
  action: string;
  happyMessage: string;
  errorMessage: string;
  @ViewChild('userDetailForm') userDetailForm: FormGroup;


  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService
  ) { }


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
        this.happyMessage = null;
        this.errorMessage = null;
        this.markFormPristine(this.userDetailForm);
        console.log("Examining segments in URL within user-detail.component.  Segments = " + segments);
        if (segments[1].toString() == 'create') {
          this.user = new User();
          this.action = 'create';
        }
        else {
          this.userService.getUser(+segments[1])
            .then(user => {
              this.user = user;
              var currentUser: User = this.currentUserService.currentUser;
              if (currentUser.id === this.user.id  || currentUser.isSuperUser)
                this.action = 'edit';
              else
                this.action = 'view';
              return this.userService.getLeaguesPlayingIn(user.id)
            })
            .then(leagues => {
              this.leaguesAsPlayer = leagues;
              return this.userService.getLeaguesAdministering(this.user.id);
            })
            .then(leagues => {
              this.leaguesAsAdmin = leagues;
            })
            .catch(serviceResponse => {
              this.user = new User();
              this.errorMessage = serviceResponse.message;
              this.happyMessage = null;
            })
        }
      })
  }

  createNewUser(): void {
    console.log("Beginning the process of creating a new user.");
    this.userService.createUser(this.user)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from create = " + serviceResponse.getMessage());
        this.happyMessage = serviceResponse.getMessage();
        this.errorMessage = null;
        this.markFormPristine(this.userDetailForm);
      })
      .catch((serviceResponse: ServiceResponse) => {
        console.log("Error message received from failed login  = " + serviceResponse.getMessage());
        this.happyMessage = null;
        this.errorMessage = serviceResponse.getMessage();
        this.markFormPristine(this.userDetailForm);
      })
  }

  updateUser(): void {
    console.log("Beginning the process of updating a user.");
    this.userService.updateUser(this.user)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from update = " + serviceResponse.getMessage());
        this.happyMessage = serviceResponse.getMessage();
        this.errorMessage = null;
        this.markFormPristine(this.userDetailForm);
      })      
      .catch((serviceResponse: ServiceResponse) => {
        console.log("Error message received from failed update  = " + serviceResponse.getMessage());
        this.happyMessage = null;
        this.errorMessage = serviceResponse.getMessage();
        this.markFormPristine(this.userDetailForm);
      })
  }

  private markFormPristine(form: FormGroup | NgForm): void {
    Object.keys(form.controls).forEach(control => {
      form.controls[control].markAsPristine();
    });
  }

  updateButtonShouldBeDisabled(): boolean {
    var result: boolean = 
      // If nothing has changed, update button is disabled  
      !this.userDetailForm.dirty || 
      // If all of the required fields are not present, the update button is disabled
      StringUtil.isEmptyNullOrUndefined(this.user.userName) || StringUtil.isEmptyNullOrUndefined(this.user.password) ||
      StringUtil.isEmptyNullOrUndefined(this.user.emailAddress) ||
      // If the user has messed with the password field and the confirmPassword does not match it, the update button is disabled
      (this.userDetailForm.controls["password"].dirty && (this.user.password !== this.confirmPassword));
    return result;
  }

  createButtonShouldBeDisabled(): boolean { 
    var result: boolean = StringUtil.isEmptyNullOrUndefined(this.user.userName) || StringUtil.isEmptyNullOrUndefined(this.user.password) ||
      StringUtil.isEmptyNullOrUndefined(this.confirmPassword) || StringUtil.isEmptyNullOrUndefined(this.user.emailAddress) ||
      this.user.password !== this.confirmPassword;
    return result;
  }

}