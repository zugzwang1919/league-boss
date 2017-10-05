// Logic level classes
import {LogicError} from './logic-error';

// Javascript packages
import * as Promise from 'bluebird';
import * as Sequelize from 'sequelize';

export class LogicUtil {

  private static theInstance: LogicUtil = new LogicUtil();

  public static instanceOf(): LogicUtil {
    return LogicUtil.theInstance;
  }

  public findById<M extends Sequelize.Model<any, any>>(model: M, id: number, loggingName: string): Promise<any> {
    console.log("  logic layer - looking for %s with an id of %s.", loggingName, id);
    return model.findById(id)
      .then((foundItem) => {
        if (foundItem != null) {
          console.log("  logic layer - %s with id of %s was found.", loggingName, id);
          return Promise.resolve(foundItem);
        }
        else {
          console.log("  logic layer - %s with id of %s was not found.", loggingName, id);
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        console.log("  logic layer - %s with id of %s was not found.", loggingName, id);
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public findAll<M extends Sequelize.Model<any, any>>(model: M, loggingName: string): Promise<any[]> {
    console.log("  logic layer - looking for  all %s ", loggingName);
    return model.findAll()
      .then((items: any[]) => {
        console.log("  logic layer - %s %s found.", items.length, loggingName);
        return Promise.resolve(items);
      })
      .catch((err) => {
        return Promise.reject(LogicError.UNKNOWN);
      });
  }

  public findOneBasedOnWhereClause<M extends Sequelize.Model<any, any>>(model: M, whereClause: any, loggingName: string): Promise<any> {
    console.log("  logic layer - looking for ONE %s based on a where clause.", loggingName);
    return this.findBasedOnWhereClause(model, whereClause, loggingName)
      .then((items: any[]) => {
        if (items.length === 1) {
          return Promise.resolve(items[0]);
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      });
  }

  public findBasedOnWhereClause<M extends Sequelize.Model<any, any>>(model: M, whereClause: any, loggingName: string): Promise<any[]> {
    console.log("  logic layer - looking for %s based on a where clause", loggingName);
    return model.findAll({ where: whereClause})
      .then((items: any[]) => {
        console.log("  logic layer - %s %s found.", items.length, loggingName);
        return Promise.resolve(items);
      })
      .catch((err) => {
        return Promise.reject(LogicError.UNKNOWN);
      });
  }

  public deleteById<M extends Sequelize.Model<any, any>>(model: M, id: number, loggingName: string): Promise<boolean> {
    console.log("  logic layer - deleting a %s with an id of %s.", loggingName, id);
    return model.destroy({where: {id}})
      .then((count: number) => {
        if (count > 0) {
          console.log("  logic layer - %s with id of %s was deleted.", loggingName, id);
          return Promise.resolve(true);
        }
        else {
          console.log("  logic layer - %s with id of %s was not found.", loggingName, id);
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      })
      .catch((err) => {
        console.log("  logic layer - %s with id of %s was not found.", loggingName, id);
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

}
