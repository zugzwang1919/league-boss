/* This is the interface for a TEAM that a GUI or anyone outside of the server
should use when interacting with the server.
*/

export interface ITeam {
  id?: number;
  teamName?: string;
  teamShortName?: string;
  aliases?: string[];
}
