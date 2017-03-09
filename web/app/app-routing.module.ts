import { NgModule }               from '@angular/core';
import { RouterModule, Routes }   from '@angular/router';

import { UserDetailComponent }    from './user/user-detail.component';
import { LoginComponent }         from './login/login.component';
import { LeagueDetailComponent }  from './league/league-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'user/:id', component: UserDetailComponent },
  { path: 'user/create', component: UserDetailComponent },
  { path: 'user', component: UserDetailComponent },
  { path: 'league', component: LeagueDetailComponent },
  { path: 'league/create', component: LeagueDetailComponent },
  { path: 'login', component: LoginComponent },  
  { path: 'logout', component: LoginComponent },  
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}