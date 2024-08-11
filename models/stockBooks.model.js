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

  const create = async (stockbook) => {
    try {
      const stockbooksModel = require('.').stockbooks
      return await stockbooksModel.create(stockbook);
    }
    catch(err) {
      throw err
    }
  }

  const getLastTransaction = async(productId) => {
    try {
      const model = require('.').stockbooks

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
      const models = require('.')

      return await models.stockbooks.findAll(
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
      const model = require('.').stockbooks

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
      const stockbooks = require('.').stockbooks
      return await stockbooks.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getByReference = async(referenceId, referenceType) => {
    try {
      const model = require('.').stockbooks

      return model.findOne({
        where: {referenceId: referenceId, type: referenceType},
      });
    }
    catch (err) {
      throw err;
    }
  }

  const getCurrentStock = async(productId) => {
    try {
      const model = require('.').stockbooks
      const Sequelize = require('sequelize');

      return model.findAll({
        where: {productId: productId},
        attributes: [[Sequelize.fn('sum', Sequelize.col('amount')), 'currentStock']],
      });
    }
    catch (err) {
      throw err;
    }
  }

  const setAssociations = (db) => {
    db.stockbooks.belongsTo(db.products)
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').stockbooks
      return await model.findAll()
    }
    catch (err) {
      throw err
    }
  }
  
  module.exports = {
    initialize,
    create,
    getAll,
    setAssociations,
    getLastTransaction,
    deleteByReference,
    update,
    getByReference,
    getCurrentStock,
    getAllAdmin
  }