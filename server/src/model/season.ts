/* This is the interface for a SEASON that a GUI or anyone outside of the server
should use when interacting with the server.
*/

export interface ISeason {
  id?: number;
  seasonName?: string;
  description?: string;
  beginDate?: Date;
  endDate?: Date;
}
