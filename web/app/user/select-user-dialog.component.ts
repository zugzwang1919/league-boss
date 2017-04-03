import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import {FormsModule, NgForm, FormGroup } from '@angular/forms'

import { User } from './user';
import { League } from '../league/league';
import { UserService } from './user-service.service';
import { CurrentUserService } from './current-user-service.service';
import { ServiceResponse } from '../common/service-response';

import { StringUtil } from '../common/string-util';


@Component({
  selector: 'selectUserDialog',
  moduleId: module.id,
  templateUrl: 'select-user-dialog.component.html',
  styleUrls: ['./select-user-dialog.component.css']
})


export class selectUserDialog {

  @Input() title: string;

  @Output() cancelFunction: EventEmitter<DialogEvent> = new EventEmitter<DialogEvent>();
  @Output() actionFunction: EventEmitter<DialogEvent> = new EventEmitter<DialogEvent>();


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

  actionButtonPushed(): void {
    this.userService.getU
    this.actionFunction.emit( null );
  }

  cancelButtonPushed(): void {
    this.cancelFunction.emit( null );
  }

}

export class DialogEvent {
  public user: User;
  contructor (user: User ) {
    this.user = user;
  }
}
