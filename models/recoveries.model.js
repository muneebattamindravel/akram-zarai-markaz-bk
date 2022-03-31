const initialize = (sequelize,Sequelize) => {
    return sequelize.define('recoveries', {
        date: {type: Sequelize.DATEONLY},
        paymentType: {type: Sequelize.STRING},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.recoveries.belongsTo(db.contacts)
    db.recoveries.belongsTo(db.accounts)
  }

  const create = async (recovery) => {
    try {
      const recoveries = require('../models').recoveries
      return await recoveries.create(recovery);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const recoveries = require('../models').recoveries
      const models = require('../models')

      return await recoveries.findAll(
          {
            where : {
              "date" : {[Op.between] : [from , to ]}
            },
            include: [
              {model: models.accounts},
              {model: models.contacts}
            ],
            order: [['date', 'DESC']],
          }
        )
    }
    catch (err) {
      throw err
    }
  }

  const getByID = async(id) => {
    try {
      const models = require('../models')
      return await models.recoveries.findByPk(id, {include: [{model: models.contacts}]})
    }
    catch (err) {
      throw err
    }
  }

  module.exports = {
    initialize,
    setAssociations,
    create,
    getAll,
    getByID
  }