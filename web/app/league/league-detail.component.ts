import 'rxjs/add/operator/switchMap';

import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { League } from './league';
import { User } from '../user/user';
import { LeagueService } from './league-service.service';
import { ServiceResponse } from '../common/service-response';


@Component({
  moduleId: module.id,
  templateUrl: 'league-detail.component.html',
  styleUrls: ['./league-detail.component.css']
})


export class LeagueDetailComponent {

  league: League;
  leagueAdmins: User[];
  leaguePlayers: User[];

  action: String;
  message: String;

  // Referential Data
  possibleSeasons: Object[] = require('../../interface/season.js');
  possibleLeagueTypes: Object[] = require('../../interface/league-type.js');

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
  ) { }


  ngOnInit(): void {
    // Set some defaults immediately
    // We'll only execute this code when the user asks for a new UserDetailComponent to be created.
    // Modifications to the UserDetailComponent are handled in the subscribe() below.
    this.setUpEmptyLeague();

    // Handle the request to begin the "Create", "Edit", (and someday "View") process
    // Based on the subscribe below, we'll constantly monitor changes to the URL 
    this.route.url
      .subscribe((segments: UrlSegment[]) => {
        this.message = null;
        console.log("Examining segments in URL within league-detail.component.  Segments = " + segments);
        if (segments[1].toString() == 'create') {
          this.setUpEmptyLeague();
          this.action = 'create';
        }
        else {
          this.action = 'edit';
          this.leagueService.getLeague(+segments[1])
            .then(league => {
              this.league = league;
              return this.leagueService.getAdmins(this.league.id)
            })
            .then(admins => {
              this.leagueAdmins = admins;
              return this.leagueService.getPlayers(this.league.id)
            })
            .then(players => {
              this.leaguePlayers = players;
            })
            .catch(serviceResponse => {
              this.setUpEmptyLeague();
              this.message = serviceResponse.message;
            })
        }
      })
  }

  createNewLeague(): void {
    console.log("Beginning the process of creating a new league.");
    this.leagueService.createLeague(this.league)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from create = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
      .catch(serviceResponse => {
        this.message = serviceResponse.message;
      })
  }

  updateLeague(): void {
    console.log("Beginning the process of updating a league.");
    this.leagueService.updateLeague(this.league)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from update = " + serviceResponse.getMessage());
        this.message = serviceResponse.getMessage();
      })
      .catch(serviceResponse => {
        this.message = serviceResponse.message;
      })
  }

  setUpEmptyLeague() {
    var league: League;
    league = new League();
    league.id = null;
    league.leagueName = '';
    league.description = '';
    league.seasonTypeIndex = 0;
    league.leagueTypeIndex = 0;
    this.league = league;
    this.leagueAdmins = null;
    this.leaguePlayers = null;
  }

}