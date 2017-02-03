import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserDetailComponent }  from './user-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/user/create', pathMatch: 'full' },
  { path: 'user/:id', component: UserDetailComponent },
  { path: 'user/create', component: UserDetailComponent },
  { path: 'user', component: UserDetailComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}