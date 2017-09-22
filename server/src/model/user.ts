/* This is the interface for a USER that a GUI or anyone outside of the server
should use when interacting with the server.
*/

export interface IUser {
  id?: number;
  userName?: string;
  password?: string;
  emailAddress?: string;
  isSuperUser?: boolean;
}
