// Logic level classes
import {LogicError} from './logic-error';

// Javascript packages
import * as Promise from 'bluebird';
import * as Sequelize from 'sequelize';

export class Logic<T> {

  private model: Sequelize.Model<T, any>;

  constructor(model: Sequelize.Model<T, any>) {
    this.model = model;
  }

  public findById(id: number): Promise<T> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - looking for %s with an id of %s.", loggingName, id);
    return this.model.findById(id)
      .then((foundItem: T) => {
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

  public findAll(): Promise<T[]> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - looking for  all %s ", loggingName);
    return this.model.findAll()
    /*
      .then((items: T[]) => {
        console.log("  logic layer - %s %s found.", items.length, loggingName);
        return Promise.resolve(items);
      })
    */
      .catch((err) => {
        return Promise.reject(LogicError.UNKNOWN);
      });
  }

  public findOneBasedOnWhereClause( whereClause: any): Promise<T> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - looking for ONE %s based on a where clause.", loggingName);
    return this.findBasedOnWhereClause(whereClause)
      .then((items: T[]) => {
        if (items.length === 1) {
          return Promise.resolve(items[0]);
        }
        else {
          return Promise.reject(LogicError.RESOURCE_NOT_FOUND);
        }
      });
  }

  public findBasedOnWhereClause(whereClause: any): Promise<T[]> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - looking for %s based on a where clause.", loggingName);
    return this.model.findAll({ where: whereClause})
      .then((items: T[]) => {
        console.log("  logic layer - %s %s found.", items.length, loggingName);
        return Promise.resolve(items);
      })
      .catch((err) => {
        console.log("  logic layer - finding %s based on a where clause unexpectedly failed.", loggingName);
        return Promise.reject(LogicError.UNKNOWN);
      });
  }

  public create(createData: any): Promise<T> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - creating a %s", loggingName);
    return this.model.create(createData)
      .then((createdItem: any) => {
        console.log("  logic layer - %s was successfully created.", loggingName);
        return Promise.resolve(createdItem);
      })
      .catch((err) => {
        console.log("  logic layer - %s was not created.", loggingName);
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public update(updateData: any, transaction?: Sequelize.Transaction): Promise<boolean> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - updating a %s", loggingName);
    const updateOptions: Sequelize.UpdateOptions = { where: {id: updateData.id}};
    if (transaction) {
      updateOptions.transaction = transaction;
    }
    return this.model.update(updateData, updateOptions)
      .then((success) => {
        console.log("  logic layer - %s was successfully updated.", loggingName);
        return Promise.resolve(true);
      })
      .catch((err) => {
        console.log("  logic layer - %s was not updated.", loggingName);
        return Promise.reject(LogicError.firmUpError(err));
      });
  }

  public deleteById(id: number): Promise<boolean> {
    const loggingName: any = this.model.getTableName();
    console.log("  logic layer - deleting a %s with an id of %s.", loggingName, id);
    return this.model.destroy({where: {id}})
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
