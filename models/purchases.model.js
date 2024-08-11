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
    db.products.hasMany(db.productstocks, {onDelete: 'RESTRICT'})
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

  const getByID = async(id) => {
    try {
      const purchases = require('../models').purchases
      const models = require('../models');
      return await purchases.findByPk(id, {
        include: [
            {model: models.companies},
            {model: models.contacts},
        ]
      })
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const accounts = require('../models').purchases
      const result = await accounts.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').purchases
      return await model.findAll()
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
    getByID,
    deleteById,
    getAllAdmin
  }