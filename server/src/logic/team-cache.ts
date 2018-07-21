// Model layer classes
import {ITeamInstance, TeamModelManager} from '../model/team-model-manager';

export class TeamCache {
  public ready: Promise<boolean>;
  private allTeams: ITeamInstance[];

  constructor() {
    this.ready = new Promise<boolean>((resolve, reject) => TeamModelManager.teamModel.findAll()
      .then(( result: ITeamInstance[]) => {
        this.allTeams = result;
        resolve(true);
      })
      .catch((error) => {
        reject(false);
      }));
  }

  public locateTeamWithAlias(alias: string): ITeamInstance {

    // Filter the array of all teams down to an array of all teams that contain the passed in alias
    const foundTeams: ITeamInstance[] = this.allTeams.filter((t: ITeamInstance) => {
      return t.aliases.filter((a: string) => a.toLowerCase().trim() === alias.toLowerCase().trim()).length > 0;
    });

    // Now for the easy part, examine the number of teams that match the passed in alias and return an appropriate response
    switch (foundTeams.length) {
      case 0:
        console.log("An alias of " + alias + " was not found" );
        return null;
      case 1:
        return foundTeams[0];
      default:
        throw new Error("More than one team was found with an alias of " + alias);
    }
  }
}
