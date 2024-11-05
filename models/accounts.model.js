  const initialize = (sequelize,Sequelize) => {
    return sequelize.define('accounts', {
      createdDate: {type: Sequelize.DATEONLY},
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
          type: Sequelize.FLOAT,
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
      isDefault: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
      }
    });
  }
  
  const setAssociations = (db) => {
    db.accounts.hasMany(db.accounttransactions)
    db.accounts.hasMany(db.bookings, {
      foreignKey: 'fromAccountId'
    });
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

  const getDefaultAccount = async() => {
    try {
      const accounts = require('../models').accounts      
      return await accounts.findOne({where: {isDefault: true}}
      )
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
  
  const getAll = async(whereConditions, includeArray) => {
    try {
      const accounts = require('../models').accounts
      return await accounts.findAll(
        {
          where: whereConditions,
          include: includeArray
        }
      )
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

  const getAllAdmin = async() => {
    try {
      const model = require('../models').accounts
      return await model.findAll()
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
    getDefaultAccount,
    getAllAdmin
  }