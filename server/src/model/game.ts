/* This is the interface for a GAME that a GUI or anyone outside of the server
should use when interacting with the server.
*/

export interface IGame {
  id?: number;

  gameDate?: Date;
  teamOneScore?: number;
  teamOnePointspread?: number;

  teamOneTwoRelationship?: string;

  teamTwoScore?: number;
  teamTwoPointspread?: number;

  comment?: string; // comment could be something like "In London"
}

export interface IFlattenedGame extends IGame {
  teamOneName?: string;
  teamOneShortName?: string;
  teamTwoName?: string;
  teamTwoShortName?: string;
}
