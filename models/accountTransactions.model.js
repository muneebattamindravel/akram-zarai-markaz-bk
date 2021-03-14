const initialize = (sequelize,Sequelize) => {
    return sequelize.define('accountTransactions', {
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      closingBalance: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
    });
  }
  
  const setAssociations = (db) => {
    db.accountTransactions.belongsTo(db.accounts)
  }
  
  const create = async (accountTransaction) => {
    try {
      const model = require('.').accountTransactions
      return await model.create(accountTransaction);
    }
    catch(err) {
      throw err
    }
  }
  
  const getAll = async() => {
    try {
      const models = require('.')
      const accountTransactions = require('.').accountTransactions
      return await accountTransactions.findAll({
        include: [
          {model: models.accounts},
        ]
      })
    }
    catch (err) {
      throw err
    }
  }

  const getLastTransaction = async(accountId) => {
    try {
      const model = require('../models').accountTransactions

      return model.findOne({
        where: {accountId: accountId},
        order: [['id', 'DESC']]
      });
    }
    catch (err) {
      throw err;
    }
  }
  
  module.exports = {
    initialize,
    create,
    getAll,
    setAssociations,
    getLastTransaction,
  }