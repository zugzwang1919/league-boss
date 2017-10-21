import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CoreModule } from './core.module';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { WolfeHttp} from './common/wolfe-http';

import { UserDetailComponent } from './user/user-detail.component';
import { selectUserDialog } from './user/select-user-dialog.component';
import { UserService } from './user/user-service.service';

import { LeagueDetailComponent} from './league/league-detail.component';
import { LeagueService } from './league/league-service.service';

import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login-service.service';


@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  AppRoutingModule,
                  HttpModule,
                  CoreModule],
  declarations: [ AppComponent,
                  UserDetailComponent,
                  selectUserDialog,
                  LoginComponent,
                  LeagueDetailComponent ],
  providers:    [ UserService,
                  LeagueService,
                  LoginService,
                  WolfeHttp ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
