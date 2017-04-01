import { Component, Input, ViewChild } from '@angular/core';
import {FormsModule, NgForm, FormGroup } from '@angular/forms'

import { User } from './user';
import { League } from '../league/league';
import { UserService } from './user-service.service';
import { CurrentUserService } from './current-user-service.service';
import { ServiceResponse } from '../common/service-response';

import { StringUtil } from '../common/string-util';


@Component({
  moduleId: module.id,
  templateUrl: 'select-user-dialog.component.html',
  //styleUrls: ['./user-detail.component.css']
})


export class SelectUserDialog {



  userName: string;
  errorMessage: string;


  constructor(
    private userService: UserService,
    private currentUserService: CurrentUserService
  ) { }


  ngOnInit(): void {
    this.userName = null;
    this.errorMessage = null;
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