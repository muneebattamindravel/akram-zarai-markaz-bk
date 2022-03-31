const initialize = (sequelize,Sequelize) => {
    return sequelize.define('productStocks', {
        lotNumber: {type: Sequelize.INTEGER, allowNull: false},
        batchNumber: {type: Sequelize.STRING},
        invoiceNumber: {type: Sequelize.STRING , allowNull: false},
        expiryDate: {type: Sequelize.DATEONLY},
        costPrice: {
          type: Sequelize.FLOAT,
        },
        quantity: {
          type: Sequelize.FLOAT,
        },
        initialQuantity: {
          type: Sequelize.FLOAT,
        },
        notes: {type: Sequelize.STRING},
    });
  }

  const setAssociations = (db) => {
    db.productStocks.belongsTo(db.products, {onDelete: 'RESTRICT'})
    db.productStocks.belongsTo(db.purchases,  {onDelete: 'RESTRICT'})
  }
  
  const create = async (productStock) => {
    try { 
      const productStocks = require('.').productStocks
      return await productStocks.create(productStock);
    }
    catch(err) {
      throw err
    }
  }

  const update = async (body, id) => {
    try {
      const ProductStocks = require('../models').productStocks
      return await ProductStocks.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getByID = async(id) => {
    try {
      const models = require('../models')
      return await models.productStocks.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }

  const get = async (condition) => {
    try {
      const models = require('../models')
      return await models.productStocks.findOne({where: condition})
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