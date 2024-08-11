const initialize = (sequelize,Sequelize) => {
    return sequelize.define('incentives', {
        date: {type: Sequelize.DATEONLY},
        type: {type: Sequelize.STRING},
        notes: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
    });
  }

  const setAssociations = (db) => {
    db.incentives.belongsTo(db.companies)
  }

  const create = async (incentive) => {
    try {
      const incentives = require('../models').incentives
      return await incentives.create(incentive);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const incentives = require('../models').incentives
      const models = require('../models')

      return await incentives.findAll(
          {
            where : {
              "date" : {[Op.between] : [from , to ]}
            },
            include: [
              {model: models.companies}
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
      return await models.incentives.findByPk(id, {include: [{model: models.companies}]})
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const incentives = require('../models').incentives
      return await incentives.destroy(
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
      const model = require('../models').incentives
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