import 'rxjs/add/operator/switchMap';

import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params, UrlSegment } from '@angular/router';
import { FormsModule, NgForm, FormGroup } from '@angular/forms';

import { League } from './league';
import { User } from '../user/user';
import { CurrentUserService } from '../user/current-user-service.service';
import { DialogEvent } from '../user/select-user-dialog.component';
import { LeagueService } from './league-service.service';
import { ServiceResponse } from '../common/service-response';
import { StringUtil } from '../common/string-util';
import { AngularUtil } from '../common/angular-util';

import { LeagueType } from '../../../../interface/league-type';
import { SeasonType } from '../../../../interface/season-type';

@Component({
  moduleId: module.id,
  templateUrl: 'league-detail.component.html',
  styleUrls: ['./league-detail.component.less']
})

export class LeagueDetailComponent {

  league: League;
  leagueAdmins: Array<User>;
  leaguePlayers: Array<User>;

  action: string;
  incomingHappyMessage: string;
  happyMessage: string;
  errorMessage: string;

  adminBeingAdded: boolean;
  playerBeingAdded: boolean;

  // Referential Data
  possibleSeasons: Object[] = SeasonType;
  possibleLeagueTypes: Object[] = LeagueType;

  @ViewChild('leagueBasicInfoForm') leagueBasicInfoForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leagueService: LeagueService,
    public currentUserService: CurrentUserService,
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
        this.adminBeingAdded = false;
        this.playerBeingAdded = false;
        if (StringUtil.isEmptyNullOrUndefined(this.incomingHappyMessage)) {
          this.clearMessages();
        }
        else {
          this.setHappyMessage(this.incomingHappyMessage);
          this.incomingHappyMessage = null;
        }
        console.log("Examining segments in URL within league-detail.component.  Segments = " + segments);
        if (segments[1].toString() === 'create') {
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
              const currentUser: User = this.currentUserService.currentUser;
              if (currentUser.isSuperUser || this.isCurrentUserAdmin()) {
                this.action = 'edit';
              }
              return this.leagueService.getPlayers(this.league.id)
            })
            .then(players => {
              this.leaguePlayers = players;
            })
            .catch(serviceResponse => {
              this.setUpEmptyLeague();
              this.setErrorMessage(serviceResponse.getMessage());
            });
        }
      });
  }

  createNewLeague(): void {
    console.log("Beginning the process of creating a new league.");
    this.leagueService.createLeague(this.league)
      .then((createdLeague: League) => {
        console.log("League was successfully created.");
        this.incomingHappyMessage = "Congrats! You've created a new league!"
        this.router.navigate(['/league', createdLeague.id]);
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
  }

  updateLeague(): void {
    console.log("Beginning the process of updating a league.");
    this.leagueService.updateLeague(this.league)
      .then((serviceResponse: ServiceResponse) => {
        console.log("Message received from update = " + serviceResponse.getMessage());
        this.setHappyMessage("Update was succesful!");
        AngularUtil.markFormPristine(this.leagueBasicInfoForm);
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
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
        this.setHappyMessage("Admin succesfully added!");
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
  }

  removeAdmin(admin: User) {
    this.leagueService.removeAdmin(this.league.id, admin.id)
      .then(success => {
        this.removeUserFromArray(this.leagueAdmins, admin);
        this.setHappyMessage("Admin succesfully removed!");
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
  }

  addPlayer(): void {
    this.playerBeingAdded = true;
  }

  onPlayerCancel() {
    this.playerBeingAdded = false;
  }

  onPlayerFound(dialogEvent: DialogEvent) {
    this.leagueService.addPlayer(this.league.id, dialogEvent.user.id)
      .then(junk => {
        this.leaguePlayers.push(dialogEvent.user);
        this.setHappyMessage("Player succesfully added!");
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
  }

  removePlayer(player: User) {
    this.leagueService.removePlayer(this.league.id, player.id)
      .then(success => {
        this.removeUserFromArray(this.leaguePlayers, player);
        this.setHappyMessage("Player succesfully removed!");
      })
      .catch(serviceResponse => {
        this.setErrorMessage(serviceResponse.getMessage());
      });
  }



  setUpEmptyLeague() {
    let league: League;
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

  updateButtonShouldBeDisabled(): boolean {
    const result: boolean =
      // If nothing has changed, update button is disabled
      !this.leagueBasicInfoForm.dirty ||
      // If all of the required fields are not present, the update button is disabled
      StringUtil.isEmptyNullOrUndefined(this.league.leagueName) || StringUtil.isEmptyNullOrUndefined(this.league.description);
    return result;
  }

  createButtonShouldBeDisabled(): boolean {
    const result: boolean = StringUtil.isEmptyNullOrUndefined(this.league.leagueName) || StringUtil.isEmptyNullOrUndefined(this.league.description);
    return result;
  }

  private isCurrentUserAdmin(): boolean {
    for (const admin of this.leagueAdmins) {
      const currentUserId: number = this.currentUserService.currentUser.id;
      if (currentUserId === admin.id) {
        return true;
      }
    }
    return false;
  }

  private setHappyMessage(hm: string) {
    this.happyMessage = hm;
    this.errorMessage = null;
  }

  private setErrorMessage(em: string) {
    this.happyMessage = null;
    this.errorMessage = em;
  }

  private clearMessages() {
    this.happyMessage = null;
    this.errorMessage = null;
  }

  private removeUserFromArray(array: Array<User>, adminToBeRemoved: User) : void {
    let i;
    for (i = 0; i < array.length; i++) {
      if (array[i].id === adminToBeRemoved.id) {
        array.splice(i, 1);
        return;
      }
    }
  }

}
