const initialize = (sequelize,Sequelize) => {
    return sequelize.define('loans', {
        date: {type: Sequelize.DATEONLY},
        isReceived: {type: Sequelize.BOOLEAN},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.loans.belongsTo(db.contacts)
    db.loans.belongsTo(db.accounts)
  }

  const create = async (loan) => {
    try {
      const loans = require('../models').loans
      return await loans.create(loan);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const loans = require('../models').loans
      const models = require('../models')

      return await loans.findAll(
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
      return await models.loans.findByPk(id, {include: [{model: models.contacts}]})
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const loans = require('../models').loans
      return await loans.destroy(
          {
            where: {id: id}
          }
        )
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
  }