import { Component, Input } from '@angular/core';

import { User } from './user';


@Component({
  moduleId: module.id,  
  selector: 'my-user-detail',
  templateUrl: 'user-detail.component.html',
})


export class UserDetailComponent {
    @Input()
    user: User;
}