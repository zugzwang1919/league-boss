/* This is the interface for a PICK that a GUI or anyone outside of the server
should use when interacting with the server.

Note: Admittedly, this is a rather simple object.  It will become associated with a game and and team (in the model-manager)
In addition, it will automatically carry a "created date" and an "updated date"
*/

export interface IPick {
  id?: number;
}
