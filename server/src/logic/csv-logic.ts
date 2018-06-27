import * as Promise from 'bluebird';
import * as Parse from 'csv-parse';
import * as Stream from 'stream';

export class CsvLogic {
  public static getGameData(scheduleAsCsv: Buffer): Promise<any[]> {
    const readableStream: Stream.Readable = new Stream.Readable();
    return new Promise((resolve, reject) => {
      let createdGames: any[];
      const parser: Parse.Parser = Parse({ columns : true }, (parseError: any, games: any[]) => {
        if (parseError) {
          return reject(parseError);
        }
        createdGames = games;
        return resolve(createdGames);
      });
      // Now that we have a parser...
      // Create a readable stream from the buffer
      readableStream.push(scheduleAsCsv);
      readableStream.push(null);
      // Pipe the stream into the parser
      readableStream.pipe(parser);
    });
  }
}
