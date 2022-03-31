const initialize = (sequelize,Sequelize) => {
    return sequelize.define('expenses', {
      date: {type: Sequelize.DATEONLY},
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {type: Sequelize.STRING},
      bookNumber: {type: Sequelize.STRING},
      billNumber: {type: Sequelize.STRING},
      amount: {type: Sequelize.FLOAT},
    });
  }
  
  const setAssociations = (db) => {
    db.accounts.hasMany(db.expenses)
  }
  
  const create = async (expense) => {
    try {
      const expenses = require('../models').expenses
      return await expenses.create(expense);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const expenses = require('../models').expenses

      return await expenses.findAll(
          {
            where : {
              "date" : {[Op.between] : [from , to ]}
            },
            order: [['date', 'DESC']],
          }
        )
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const model = require('../models').expenses
      const result = await model.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getByID = async(id) => {
    try {
      const model = require('../models').expenses
      return await model.findByPk(id)
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
    deleteById,
    getByID
  }