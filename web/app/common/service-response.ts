import { Response } from '@angular/http';

export class ServiceResponse {
  private serviceReturnCode: ServiceReturnCode;
  private message: string;


  constructor(res: Response) {
    switch (res.status) {
      case 200:
        this.serviceReturnCode = ServiceReturnCode.OK;
        this.message = "Success!";
        break;
      case 301:
        this.serviceReturnCode = ServiceReturnCode.AUTHENTICATION_ERROR;
        this.message = res.json().message;
        break;
      default:
        this.serviceReturnCode = ServiceReturnCode.ERROR;
        this.message = res.json().message;
        break;
    }
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(newMessage: string) : void {
    this.message = newMessage;
  }


  /*
  getServiceReturnCode() : ServiceReturnCode {
    return this.getServiceReturnCode;
  }
  */

}

enum ServiceReturnCode {
  OK,
  AUTHENTICATION_ERROR,
  ERROR
};
