const initialize = (sequelize,Sequelize) => {
    return sequelize.define('categories', {
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
      description: {
        type: Sequelize.STRING
      },
    });
  }

  const setAssociations = (db) => {
    db.categories.hasMany(db.products, {onDelete: 'RESTRICT'})
  }
  
  const create = async (category) => {
    try {
      const categories = require('../models').categories
      return await categories.create(category);
    }
    catch(err) {
      throw err
    }
  }
  
  const update = async (body, id) => {
    try {
      const categories = require('../models').categories
      return await categories.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getByID = async(id) => {
    try {
      const categories = require('../models').categories
      return await categories.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }
  
  const getAll = async() => {
    try {
      const categories = require('../models').categories
      return await categories.findAll()
    }
    catch (err) {
      throw err
    }
  }
  
  const deleteById = async(id) => {
    try {
      const categories = require('../models').categories
      const result = await categories.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const exists = async(conditions) => {
    try {
      const categories = require('../models').categories
      const result = await categories.findAll({where: conditions})
      return result.length > 0 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').categories
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
    getAllAdmin
  }