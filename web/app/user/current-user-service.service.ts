import { Injectable } from '@angular/core';

import { User } from "./user";

@Injectable()
export class CurrentUserService {

  public currentUser: User;
  public wolfeAuthenticationToken: string;

} 