/* This is the interface for a LEAGUE that a GUI or anyone outside of the server
should use when interacting with the server.
*/

export interface ILeague {
  id?: number;
  leagueName?: string;
  description?: string;
  seasonIndex?: number;
  leagueTypeIndex?: number;
}
