const initialize = (sequelize,Sequelize) => {
    return sequelize.define('productStocks', {
        lotNumber: {type: Sequelize.INTEGER, allowNull: false},
        batchNumber: {type: Sequelize.STRING},
        expiryDate: {type: Sequelize.DATE, allowNull: false},
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
      const models = require('../models')
      return await models.productStocks.update(body, {where: {id:id}}) == 1 ? true : false
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

  const getAllByID = async(productId) => {
    try {
        const models = require('../models')
        return await models.productStocks.findAll({
            where: {productId: productId},
        })
    }
    catch (err) {
        throw err
    }
  }

  const getCurrentStock = async(productId) => {
    try {
        const models = require('../models')
        return await models.productStocks.findAll({
          attributes: ['quantity', [sequelize.fn('sum', sequelize.col('quantity')), 'currentStock']],
          // group : ['ProductStocks.quantity'],
          // raw: true,
          // order: sequelize.literal('total DESC')
        })
    }
    catch (err) {
        throw err
    }
  }

  module.exports = {
    initialize,
    create,
    setAssociations,
    getAllByID,
    getByID,
    update,
  }