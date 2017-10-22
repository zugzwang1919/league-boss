import { environment } from '../../environments/environment';


export class ServiceUtil {

  public static buildUrl(inputString: string): string {
    return "http://" + environment.serverName + ":" + environment.serverPort + inputString;
  }

}
