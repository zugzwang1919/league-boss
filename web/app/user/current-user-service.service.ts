import { Injectable } from '@angular/core';

import { User } from "./user";

@Injectable()
export class CurrentUserService {

  private currentUser: User;


  setCurrentUser(newCurrentUser: User): void {
    this.currentUser = newCurrentUser;
  }

  getCurrentUser(newCurrentUser: User): User {
    return this.currentUser;
  }
} 