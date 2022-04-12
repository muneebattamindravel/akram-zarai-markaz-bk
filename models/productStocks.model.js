const initialize = (sequelize,Sequelize) => {
    return sequelize.define('productstocks', {
        lotNumber: {type: Sequelize.INTEGER, allowNull: false},
        batchNumber: {type: Sequelize.STRING},
        invoiceNumber: {type: Sequelize.STRING , allowNull: false},
        expiryDate: {type: Sequelize.DATEONLY},
        costPrice: {type: Sequelize.FLOAT,},
        quantity: {type: Sequelize.FLOAT,},
        initialQuantity: {type: Sequelize.FLOAT,},
        notes: {type: Sequelize.STRING},
    });
  }

  const setAssociations = (db) => {
    db.productstocks.belongsTo(db.products, {onDelete: 'RESTRICT'})
    db.productstocks.belongsTo(db.purchases,  {onDelete: 'RESTRICT'})
  }
  
  const create = async (productStock) => {
    try { 
      const productStocks = require('.').productstocks
      return await productStocks.create(productstock);
    }
    catch(err) {
      throw err
    }
  }

  const update = async (body, id) => {
    try {
      const ProductStocks = require('../models').productstocks
      return await ProductStocks.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getByID = async(id) => {
    try {
      const models = require('../models')
      return await models.productstocks.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }

  const get = async (condition) => {
    try {
      const models = require('../models')
      return await models.productstocks.findOne({where: condition})
    }
    catch (err) {
      throw err
    }
  }

  module.exports = {
    initialize,
    create,
    setAssociations,
    getByID,
    update,
    get,
  }