const initialize = (sequelize,Sequelize) => {
    return sequelize.define('units', {
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
      },
      allowDecimal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
  }
  
  const setAssociations = (db) => {
    db.units.hasMany(db.products, {onDelete: 'RESTRICT'})
  }

  const create = async (unit) => {
    try {
      const units = require('../models').units
      return await units.create(unit);
    }
    catch(err) {
      throw err
    }
  }
  
  const update = async (body, id) => {
    try {
      const units = require('../models').units
      return await units.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getByID = async(id) => {
    try {
      const units = require('../models').units
      return await units.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }
  
  const getAll = async() => {
    try {
      const units = require('../models').units
      return await units.findAll()
    }
    catch (err) {
      throw err
    }
  }
  
  const deleteById = async(id) => {
    try {
      const units = require('../models').units
      const result = await units.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const exists = async(conditions) => {
    try {
      const units = require('../models').units
      const result = await units.findAll({where: conditions})
      return result.length > 0 ? true : false
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