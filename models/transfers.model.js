const initialize = (sequelize,Sequelize) => {
    return sequelize.define('transfers', {
        date: {type: Sequelize.DATEONLY},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
        amount: {type: Sequelize.FLOAT},
        notes: {type: Sequelize.STRING},
    });
  }

  const setAssociations = (db) => {

    db.transfers.belongsTo(db.accounts, {
        foreignKey: 'fromAccountId'
    })

    db.transfers.belongsTo(db.accounts, {
        foreignKey: 'toAccountId'
    })
  }

  const create = async (transfer) => {
    try {
      const transfers = require('../models').transfers
      return await transfers.create(transfer);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async(from, to) => {
    try {
      const { Op } = require("sequelize");
      const transfers = require('../models').transfers

      return await transfers.findAll(
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

  const getByID = async(id) => {
    try {
      const model = require('../models').transfers
      return await model.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }

  const deleteById = async(id) => {
    try {
      const model = require('../models').transfers
      const result = await model.destroy({where: {id: id}})
      return result == 1 ? true : false
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
    deleteById,
    getByID
  }