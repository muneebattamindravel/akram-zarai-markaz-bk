const initialize = (sequelize,Sequelize) => {
    return sequelize.define('saleReturns', {
      returnAmount: {type: Sequelize.FLOAT},
      lotsReturnedToJson: {type: Sequelize.TEXT},
      quantity: {type: Sequelize.FLOAT},
    });
  }
  
  const setAssociations = (db) => {
    db.salereturns.belongsTo(db.sales,  {onDelete: 'RESTRICT'})
    db.salereturns.belongsTo(db.products,  {onDelete: 'RESTRICT'})
  }
  
  const create = async (salereturn) => {
    try {
      const salereturns = require('.').salereturns
      return await salereturns.create(salereturn);
    }
    catch(err) {
      throw err
    }
  }

   //delete all sale returns posted of a particular sale
   const DeleteSaleReturns = async (saleId) => {
    try {
      const saleReturnsModel = require('.').salereturns
      return await saleReturnsModel.destroy(
          {
            where: {
              saleId: saleId
            }
          }
        );
    }
    catch (err) {
      throw err;
    }
  }

  const update = async (body, id) => {
    try {
      const salereturns = require('.').salereturns
      return await salereturns.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getAll = async (whereConditions, includeArray) => {
    try {
      const models = require('.')
      return await models.salereturns.findAll(
        {
          where: whereConditions,
          include: includeArray
        }
      )
    }
    catch (err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').salereturns
      return await model.findAll()
    }
    catch (err) {
      throw err
    }
  }

  
  
  module.exports = {
    initialize,
    create,
    update,
    setAssociations,
    getAll,
    getAllAdmin,
    DeleteSaleReturns
  }