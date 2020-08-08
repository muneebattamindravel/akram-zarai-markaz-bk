const initialize = (sequelize,Sequelize) => {
    return sequelize.define('purchases', {
        invoiceDate: {type: Sequelize.DATE},
        invoiceNumber: {type: Sequelize.STRING},
        imageURL: {type: Sequelize.STRING},
    });
  }

  const setAssociations = (db) => {
    db.purchases.belongsTo(db.contacts)
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

  module.exports = {
    initialize,
    create,
    setAssociations,
  }