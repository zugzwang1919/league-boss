
export class LogicError {

  public static RESOURCE_NOT_FOUND  = new LogicError("Resource not found.", "The specified resource was not found.");
  public static LOGIN_FAILED = new LogicError("Login failed.", "The ID / Password combination is not valid");
  public static FORBIDDEN = new LogicError("Forbidden", "You do not have the authority to access the specified resource.");
  public static INCOMPLETE_INPUT = new LogicError("Incomplete", "There was not enough data provided to fulfill the request.");
  public static DUPLICATE = new LogicError("Duplicate", "This entity already exisits.");
  public static TEAM_NOT_FOUND = new LogicError("Team not found.", "While creating a schedule, a team could not be found.");
  // tslint:disable-next-line:max-line-length
  public static SCHEDULE_ALREADY_PRESENT = new LogicError("Schedule already present.", "A schedule already exists for the season.  Please remove it prior to adding a new one.");
  // tslint:enable-next-line:max-line-length
  public static UNKNOWN = new LogicError("Unknown", "An unknown error occurred.");

  private _name: string;
  private _message: string;

  constructor(name: string, message: string) {
    this._name = name;
    this._message = message;
  }

  get name(): string {
    return this._name;
  }

  get message(): string {
    return this._message;
  }

  public static firmUpError(err: any): LogicError {
    // If we were given a LogicError, no need to do anything
    if (err instanceof LogicError) {
      return err;
    }
    // Otherwise, let's start with an UNKNOWN message and try to improve it
    // If it has a name or message property, then use it.
    let name: string = LogicError.UNKNOWN.name;
    let message: string = LogicError.UNKNOWN.message;
    if (err != null) {
      if (err.name != null) {
        name = err.name;
      }
      if (err.message != null) {
        message = err.message;
      }
    }
    return new LogicError(name, message);
  }
}
