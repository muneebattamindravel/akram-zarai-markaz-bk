const initialize = (sequelize,Sequelize) => {
    return sequelize.define('accounttransactions', {
      transactionDate: {type: Sequelize.DATEONLY},
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      closingBalance: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING
      },
      details: {
        type: Sequelize.STRING
      },
      referenceId: {
        type: Sequelize.INTEGER,
      },
      bookNumber: {type: Sequelize.STRING,},
      billNumber: {type: Sequelize.STRING,},
      invoiceNumber: {type: Sequelize.STRING,},
      prNumber: {type: Sequelize.STRING,}
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

  const getAll = async (whereConditions, includeArray, order = 'ASC') => {
    try {
      const models = require('../models')
      return await models.accountTransactions.findAll(
        {
          where: whereConditions,
          include: includeArray,
        }
      )
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

  const getFirstTransaction = async(accountId) => {
    try {
      const model = require('../models').accountTransactions

      return model.findOne({
        where: {accountId: accountId},
        order: [['id', 'ASC']]
      });
    }
    catch (err) {
      throw err;
    }
  }

  const update = async (body, id) => {
    try {
      const model = require('../models').accountTransactions
      return await model.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const deleteByReference = async(referenceId, referenceType) => {
    try {
      const model = require('../models').accountTransactions

      return model.destroy({
        where: {referenceId: referenceId, type: referenceType},
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
    deleteByReference,
    getFirstTransaction,
    update
  }