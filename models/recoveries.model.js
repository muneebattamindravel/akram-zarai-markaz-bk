const initialize = (sequelize,Sequelize) => {
    return sequelize.define('recoveries', {
        date: {type: Sequelize.DATEONLY},
        isReceived: {type: Sequelize.BOOLEAN},
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
            order: [['id', 'DESC']],
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

  const deleteById = async(id) => {
    try {
      const recoveries = require('../models').recoveries
      return await recoveries.destroy(
          {
            where: {id: id}
          }
        )
    }
    catch (err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').recoveries
      return await model.findAll()
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
    getByID,
    deleteById,
    getAllAdmin
  }