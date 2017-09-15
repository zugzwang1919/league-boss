

export class LogicError {

  static RESOURCE_NOT_FOUND  = new LogicError("Resource not found.","The specified resource was not found.");
  static LOGIN_FAILED = new LogicError("Login failed.", "The ID / Password combination is not valid"); 
  static FORBIDDEN = new LogicError("Forbidden", "You do not have the authority to access the specified resource.");
  static INCOMPLETE_INPUT = new LogicError("Incomplete", "There was not enough data provided to fulfill the request.");
  static DUPLICATE = new LogicError("Duplicate", "This entity already exisits.");
  static UNKNOWN = new LogicError("Unknown", "An unknown error occurred.");

  
  private _name: string;
  private _message: string;

  constructor(name: string, message: string) {
    this._name = name;
    this._message = message;
  }

  get name() : string {
    return this._name;
  }

  get message() : string {
    return this._message;
  }

  static firmUpError(err: any): LogicError {
    // If we were given a LogicError, no need to do anything
    if (err instanceof LogicError) 
      return err;
    // Otherwise, let's start with an UNKNOWN message and try to improve it
    // If it has a name or message property, then use it.
    let name = LogicError.UNKNOWN.name;
    let message = LogicError.UNKNOWN.message;
    if (err != null) {
      if (err.name != null)
        name = err.name;
      if (err.message != null)
        message = err.message;
    }
    return new LogicError(name, message);
  }
}


