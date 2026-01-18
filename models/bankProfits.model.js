const initialize = (sequelize,Sequelize) => {
    return sequelize.define('bankprofits', {
        date: {type: Sequelize.DATEONLY},
        type: {type: Sequelize.STRING},
        notes: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.bankprofits.belongsTo(db.accounts)
  }

  const create = async (bankprofit) => {
    try {
      const bankprofits = require('../models').bankprofits
      return await bankprofits.create(bankprofit);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const bankprofits = require('../models').bankprofits
      const models = require('../models')

      return await bankprofits.findAll(
          {
            where : {
              "date" : {[Op.between] : [from , to ]}
            },
            include: [
              {model: models.accounts}
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
      return await models.bankprofits.findByPk(id, {include: [{model: models.accounts}]})
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const bankprofits = require('../models').bankprofits
      return await bankprofits.destroy(
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
      const model = require('../models').bankprofits
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