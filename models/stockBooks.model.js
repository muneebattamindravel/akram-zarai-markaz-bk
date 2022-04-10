const initialize = (sequelize,Sequelize) => {
    return sequelize.define('stockbooks', {
        date: {type: Sequelize.DATEONLY},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
        invoiceNumber: {type: Sequelize.STRING},
        type: {type: Sequelize.STRING},
        notes: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
        closing: {type: Sequelize.FLOAT},
        referenceId: {type: Sequelize.INTEGER, allowNull: true}
    });
  }

  const create = async (stockBook) => {
    try {
      const stockBooksModel = require('../models').stockBooks
      return await stockBooksModel.create(stockBook);
    }
    catch(err) {
      throw err
    }
  }

  const getLastTransaction = async(productId) => {
    try {
      const model = require('../models').stockBooks

      return model.findOne({
        where: {productId: productId},
        order: [['id', 'DESC']]
      });
    }
    catch (err) {
      throw err;
    }
  }

  const getAll = async (whereConditions, includeArray) => {
    try {
      const models = require('../models')
      return await models.stockBooks.findAll(
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

  const deleteByReference = async(referenceId, referenceType) => {
    try {
      const model = require('../models').stockBooks

      return model.destroy({
        where: {referenceId: referenceId, type: referenceType},
      });
    }
    catch (err) {
      throw err;
    }
  }

  const update = async (body, id) => {
    try {
      const stockBooks = require('../models').stockBooks
      return await stockBooks.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getByReference = async(referenceId, referenceType) => {
    try {
      const model = require('../models').stockBooks

      return model.findOne({
        where: {referenceId: referenceId, type: referenceType},
      });
    }
    catch (err) {
      throw err;
    }
  }

  const setAssociations = (db) => {
    db.stockBooks.belongsTo(db.products)
  } 
  
  module.exports = {
    initialize,
    create,
    getAll,
    setAssociations,
    getLastTransaction,
    deleteByReference,
    update,
    getByReference
  }