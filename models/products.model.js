const Sequelize = require('sequelize');
const initialize = (sequelize,Sequelize) => {
    return sequelize.define('products', {
        name: {type: Sequelize.STRING, allowNull: false},
        salePrice: {
          type: Sequelize.FLOAT,
        },
        description: {type: Sequelize.STRING, allowNull: false},
        alertQuantity: {
          type: Sequelize.FLOAT,
        },
        imageURL: {type: Sequelize.STRING, allowNull: false},
        nextLotNumber: {type: Sequelize.INTEGER, defaultValue: 1, allowNull: false}
    });
  }

  const setAssociations = (db) => {
    db.products.belongsTo(db.companies)
    db.products.belongsTo(db.units)
    db.products.belongsTo(db.categories)
    db.products.hasMany(db.productStocks, {onDelete: 'RESTRICT'})
    db.products.hasMany(db.saleItems);
  }
  
  const create = async (product) => {
    try {
      const products = require('../models').products
      return await products.create(product);
    }
    catch(err) {
      throw err
    }
  }
  
  const update = async (body, id) => {
    try {
      const products = require('../models').products
      return await products.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getByID = async(id) => {
    try {
      const models = require('../models')
      return await models.products.findByPk(id, {
          include: [
              {model: models.companies},
              {model: models.categories},
              {model: models.units},
              {model: models.productStocks},
          ]
      })
  }
    catch (err) {
      throw err
    }
  }

const getAll = async() => {
  try {
      const models = require('../models')
      return await models.products.findAll({
          include: [
              {model: models.companies},
              {model: models.categories},
              {model: models.units},
              {model: models.productStocks},
          ]
      })
  }
  catch (err) {
      throw err
  }
}

const deleteById = async(id) => {
    try {
      const products = require('../models').products
      const result = await products.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const exists = async(conditions) => {
    try {
      const products = require('../models').products
      const result = await products.findAll({where: conditions})
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