/* jshint indent: 2 */

module.exports = function(){
    return {
         definition : function(sequelize, Sequelize) {
            return sequelize.define('user', {
              name: {
                type: Sequelize.STRING
              },
              userName: {
                type: Sequelize.STRING
              },  
              password: {
                type: Sequelize.STRING
              },  
              emailAddress: {
                type: Sequelize.STRING
              }  
            }, 
            {
              freezeTableName: true // Model tableName will be the same as the model name
            }
         )},
         prePopulate : function (User) {
           User.sync({force: true}). then(function() {
              console.log("Request received to pre-populate Users")
              User.create({
                name: 'Russ Wolfe',
                userName: 'RWW',
                password: 'RWW',
                emailAddress: 'russ.wolfe@gmail.com',
                
              })
              User.create({
                name: 'Tom Brady',
                userName: 'TB',
                password: 'TB',
                emailAddress: 'tom.brady@gmail.com',
                
              })
           })
         } 
    }
}