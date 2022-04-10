const initialize = (sequelize,Sequelize) => {
    return sequelize.define('purchases', {
      invoiceNumber: {type: Sequelize.STRING},
      purchaseType: {type: Sequelize.INTEGER},
      invoiceDate: {type: Sequelize.DATEONLY},
      notes: {type: Sequelize.STRING},
      totalAmount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.purchases.belongsTo(db.contacts)
    db.purchases.belongsTo(db.companies)
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
        include: [
          {model: models.contacts},
          {model: models.companies}
        ],
        order: [['invoiceDate', 'DESC']],
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