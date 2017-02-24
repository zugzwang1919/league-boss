import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
import { HttpModule }           from '@angular/http';
import { CoreModule }           from './core.module';


import { AppRoutingModule }     from './app-routing.module';
import { AppComponent }         from './app.component';

import { WolfeHttp}             from './common/wolfe-http';

import { UserDetailComponent }  from './user/user-detail.component';
import { UserService }          from './user/user-service.service';

import { LoginComponent }       from './login/login.component';
import { LoginService }         from './login/login-service.service';

@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  AppRoutingModule,
                  HttpModule,
                  CoreModule],
  declarations: [ AppComponent,
                  UserDetailComponent,
                  LoginComponent ],
  providers:    [ UserService,
                  LoginService,
                  WolfeHttp ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
