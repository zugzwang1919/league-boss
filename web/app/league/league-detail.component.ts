import 'rxjs/add/operator/switchMap';

import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { League } from './league';
import { LeagueService } from './league-service.service';
import { ServiceResponse } from '../common/service-response';


@Component({
  moduleId: module.id,
  templateUrl: 'league-detail.component.html',
})


export class LeagueDetailComponent {

  league: League;

  action: String;
  message: String;

  // Referential Data
  possibleSeasons: Object[] = require('../../interface/season.js');

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
  ) { }


  ngOnInit(): void {
    // Set some defaults immediately
    // We'll only execute this code when the user asks for a new UserDetailComponent to be created.
    // Modifications to the UserDetailComponent are handled in the subscribe() below.
    this.league = new League();
    this.league.leagueName = '';
    this.league.description = '';
    this.league.seasonTypeIndex = 1;
    this.league.leagueTypeIndex = 0;

    // Handle the request to begin the "Create", "Edit", (and someday "View") process
    // Based on the subscribe below, we'll constantly monitor changes to the URL 
    this.route.url
      .subscribe((segments: UrlSegment[]) => {
        this.message = null;
        console.log("Examining segments in URL within league-detail.component.  Segments = " + segments);
        if (segments[1].toString() == 'create') {
          this.league.leagueName = '';
          this.league.description = '';
          this.league.seasonTypeIndex = 1;
          this.league.leagueTypeIndex = 0;
          this.action = 'create';
        }
        else {
          /*
          this.userService.getUser(+segments[1])
            .then(user => {
              this.action = 'edit';
              this.user = user;
              if (user.id == null)
                this.message = "The specified user could not be found.  Try another Id.";
            })
          */
        }
      })
  }

  createNewLeague(): void {
    console.log("Beginning the process of creating a new user.");
    this.leagueService.createLeague(this.league)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from create = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
  }

  updateLeague(): void {
    console.log("Beginning the process of updating a user.");
    this.leagueService.updateLeague(this.league)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from update = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
  }

}