import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { WolfeHttp } from '../common/wolfe-http';
import { Season } from './season';
import { ServiceResponse } from '../common/service-response';
import { ServiceUtil } from '../common/service-util';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {

  constructor(
    private http: WolfeHttp,
  ) { }

  getSeasons(): Promise<Season[]> {
    console.log("Inside SeasonService: Starting to look for AllSeasonsan id of ");
    const getAllSeasonsUrl: string = ServiceUtil.buildUrl('/season');
    return this.http.get(getAllSeasonsUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

  getSeason(id: number): Promise<Season> {
    console.log("Inside SeasonService: Starting to look for Season with an id of " + id);
    const getSeasonUrl: string = ServiceUtil.buildUrl('/season/' + id);
    return this.http.get(getSeasonUrl)
      .toPromise()
      .then((res: Response) => {
        return Promise.resolve(res.json());
      })
      .catch((res: Response) => {
        return Promise.reject(new ServiceResponse(res));
      });
  }

}
