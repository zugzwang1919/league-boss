import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import {FormsModule, NgForm, FormGroup } from '@angular/forms';

import { User } from './user';
import { League } from '../league/league';
import { UserService } from './user.service';
import { CurrentUserService } from './current-user-service.service';
import { ServiceResponse } from '../common/service-response';

import { StringUtil } from '../common/string-util';


@Component({
  selector: 'app-select-user-dialog',
  moduleId: module.id,
  templateUrl: 'select-user-dialog.component.html',
  styleUrls: ['./select-user-dialog.component.less']
})


export class SelectUserDialogComponent implements OnInit {

  @Input() title: string;
  @Input() actionButtonName: string;

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
    this.userService.getUserByName(this.userName)
    .then((user: User) => {
      const event: DialogEvent = new DialogEvent(user);
      this.actionFunction.emit( event );
      this.errorMessage = null;
    })
    .catch((serviceResponse: ServiceResponse) => {
      this.errorMessage = "Requested user was not found.";
    });
  }

  cancelButtonPushed(): void {
    this.cancelFunction.emit( null );
  }

}

export class DialogEvent {
  public user: User;
  constructor (user: User ) {
    this.user = user;
  }
}
