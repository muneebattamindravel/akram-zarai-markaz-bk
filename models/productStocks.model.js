const initialize = (sequelize,Sequelize) => {
    return sequelize.define('productStocks', {
        lotNumber: {type: Sequelize.INTEGER, allowNull: false},
        batchNumber: {type: Sequelize.STRING},
        expiryDate: {type: Sequelize.DATE, allowNull: true},
        costPrice: {type: Sequelize.DECIMAL(10,2)},
        quantity: {type: Sequelize.INTEGER,allowNull: false},
        initialQuantity: {type: Sequelize.INTEGER, allowNull: false},
        notes: {type: Sequelize.STRING},
    });
  }

  const setAssociations = (db) => {
    db.productStocks.belongsTo(db.products, {onDelete: 'RESTRICT'})
    db.productStocks.belongsTo(db.purchases, {onDelete: 'RESTRICT'})
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

  module.exports = {
    initialize,
    create,
    setAssociations,
    getAllByID,
    getByID,
    update,
  }