const initialize = (sequelize,Sequelize) => {
    return sequelize.define('purchases', {
        invoiceDate: {type: Sequelize.DATE},
        invoiceNumber: {type: Sequelize.STRING},
        imageURL: {type: Sequelize.STRING},
        notes: {type: Sequelize.STRING},
        totalAmount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.purchases.belongsTo(db.contacts)
    db.products.hasMany(db.productStocks, {onDelete: 'RESTRICT'})
  }
  
  const create = async (purchase) => {
    try {
        const purchases = require('../models').purchases
      return await purchases.create(purchase);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async() => {
    try {
      const purchases = require('../models').purchases
      const models = require('../models')
      return await purchases.findAll({
        include: [models.contacts]
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
    getAll,
  }