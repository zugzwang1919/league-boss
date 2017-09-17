import * as  Sequelize from  'sequelize';

export class ModelManager {
    public sequelize:Sequelize.Sequelize;
    public initialize( populateWithTestData?: boolean) {
        populateWithTestData = populateWithTestData || false;

        this.sequelize = new Sequelize('leagueboss', 'root', 'tchssoccer', {
            host: 'localhost',
            dialect: 'mysql',
            pool: {
              max: 5,
              min: 0,
              idle: 10000
            }
          });
    }
}