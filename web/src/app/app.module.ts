import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CoreModule } from './core.module';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { WolfeHttp} from './common/wolfe-http';

import { UserDetailComponent } from './user/user-detail.component';
import { SelectUserDialogComponent } from './user/select-user-dialog.component';

import { LeagueDetailComponent} from './league/league-detail.component';

import { LoginComponent } from './login/login.component';


@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  AppRoutingModule,
                  HttpModule,
                  CoreModule],
  declarations: [ AppComponent,
                  UserDetailComponent,
                  SelectUserDialogComponent,
                  LoginComponent,
                  LeagueDetailComponent ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
