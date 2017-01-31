import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
import { HttpModule }           from '@angular/http';

import { AppRoutingModule }     from './app-routing.module';

import { AppComponent }         from './app.component';
import { UserDetailComponent }  from './user-detail.component';

import { UserService }          from './user-service.service';

@NgModule({
  imports:      [ BrowserModule,
                  FormsModule,
                  AppRoutingModule,
                  HttpModule ],
  declarations: [ AppComponent,
                  UserDetailComponent ],
  providers:    [ UserService ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
