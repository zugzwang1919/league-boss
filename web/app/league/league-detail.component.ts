import 'rxjs/add/operator/switchMap';

import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { League } from './league';
import { User } from '../user/user';
import { CurrentUserService } from '../user/current-user-service.service';
import { DialogEvent } from '../user/select-user-dialog.component';
import { LeagueService } from './league-service.service';
import { ServiceResponse } from '../common/service-response';


@Component({
  moduleId: module.id,
  templateUrl: 'league-detail.component.html',
  styleUrls: ['./league-detail.component.css']
})

/*  Adding a comment here to see if the other repo picks it up */
export class LeagueDetailComponent {

  league: League;
  leagueAdmins: User[];
  leaguePlayers: User[];

  action: string;
  message: string;

  adminBeingAdded: boolean;

  // Referential Data
  possibleSeasons: Object[] = require('../../interface/season-type.js');
  possibleLeagueTypes: Object[] = require('../../interface/league-type.js');

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
    private currentUserService: CurrentUserService,
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
          // initially set the action to 'view'
          this.action = 'view';
          this.leagueService.getLeague(+segments[1])
            .then(league => {
              this.league = league;
              return this.leagueService.getAdmins(this.league.id)
            })
            .then(admins => {
              this.leagueAdmins = admins;
              // override the action to 'edit' if the user has sufficient credentials
              var currentUser: User = this.currentUserService.currentUser;
              if ( currentUser.isSuperUser || this.isCurrentUserAdmin() )
                this.action = 'edit';
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

  addAdmin(): void {
    this.adminBeingAdded = true;
  }

  onAdminCancel() {
    this.adminBeingAdded = false;
  }

  onAdminFound(dialogEvent: DialogEvent) {
    this.leagueService.addAdmin(this.league.id, dialogEvent.user.id)
      .then(junk => {
        this.leagueAdmins.push(dialogEvent.user);
      })
      .catch(serviceResponse => {
        this.message = serviceResponse.message;
      })
  }

  private isCurrentUserAdmin() : boolean {
    for( var admin of this.leagueAdmins) {
      var currentUserId: number = this.currentUserService.currentUser.id;
      if ( currentUserId === admin.id )
        return true;
    }
    return false;
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