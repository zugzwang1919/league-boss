import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { WolfeHttp } from '../common/wolfe-http';
import { League } from "./league";
import { ServiceResponse } from '../common/service-response';


@Injectable()
export class LeagueService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getLeague(id: Number): Promise<League> {
    console.log("Inside LeagueService: Starting to look for League with an id of " + id);

    return new Promise(resolve => {
      this.http.get('http://localhost:1919/league/' + id)
        .toPromise()
        .then((res: Response) => resolve(new ServiceResponse(res)))
        .catch((res: Response) => resolve(new ServiceResponse(res)))
    })
  }

  createLeague(league: League): Promise<ServiceResponse> {
    console.log("Inside LeagueService:  Beginning 'Create League' process");
    return new Promise(resolve => {
      this.http.post('http://localhost:1919/league', league)
        .toPromise()
        .then((res: Response) => resolve(new ServiceResponse(res)))
        .catch((res: Response) => resolve(new ServiceResponse(res))
        )
    })
  }

  updateLeague(league: League): Promise<ServiceResponse> {
    console.log("Inside LeagueService:  Beginning 'Update League' process");
    return new Promise(resolve => {
      this.http.put('http://localhost:1919/league/' + league.id, league)
        .toPromise()
        .then((res: Response) => resolve(new ServiceResponse(res)))
        .catch((res: Response) => resolve(new ServiceResponse(res))
        )
    })
  }

}