const initialize = (sequelize,Sequelize) => {
    return sequelize.define('accounts', {
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      openingBalance: {
          type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.STRING
      },
      bankName: {
        type: Sequelize.STRING,
      },
      bankAccountNumber: {
        type: Sequelize.STRING,
      },
    });
  }
  
  const setAssociations = (db) => {
    db.accounts.belongsTo(db.companies)
  }
  
  const create = async (account) => {
    try {
      const accounts = require('../models').accounts
      return await accounts.create(account);
    }
    catch(err) {
      throw err
    }
  }
  
  const update = async (body, id) => {
    try {
      const accounts = require('../models').accounts
      return await accounts.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getByID = async(id) => {
    try {
      const accounts = require('../models').accounts
      return await accounts.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }
  
  const exists = async(conditions) => {
    try {
      const accounts = require('../models').accounts
      const result = await accounts.findAll({where: conditions})
      return result.length > 0 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getAll = async() => {
    try {
      const models = require('../models')
      const accounts = require('../models').accounts
      return await accounts.findAll({
        include: [
          {model: models.companies},
        ]
      })
    }
    catch (err) {
      throw err
    }
  }
  
  const deleteById = async(id) => {
    try {
      const accounts = require('../models').accounts
      const result = await accounts.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  module.exports = {
    initialize,
    create,
    update,
    getByID,
    getAll,
    deleteById,
    setAssociations,
    exists,
  }