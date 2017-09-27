// Model layer classes
import {ITeamInstance, TeamModelManager} from '../model/team-model-manager';

export class TeamCache {
  private allTeams: ITeamInstance[];
  private ready: Promise<boolean>;

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
    let count: number = 0;
    let foundTeam: ITeamInstance;
    this.allTeams.forEach((t: ITeamInstance) => {
      t.aliases.forEach((a: string) => {
        if (a.toLowerCase().trim() === alias.toLowerCase().trim()) {
          foundTeam = t;
          count++;
        }
      });
    });
    switch (count) {
      case 0:
        return null;
      case 1:
        return foundTeam;
      default:
        throw new Error("More than one team was found with an alias of " + alias);
    }
  }
}
