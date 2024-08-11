const Sequelize = require('sequelize');
const initialize = (sequelize,Sequelize) => {
    return sequelize.define('products', {
        name: {type: Sequelize.STRING, allowNull: false},
        salePrice: {type: Sequelize.FLOAT,},
        description: {type: Sequelize.STRING, allowNull: false},
        alertQuantity: {type: Sequelize.FLOAT,},
        imageURL: {type: Sequelize.STRING, allowNull: false},
        nextLotNumber: {type: Sequelize.INTEGER, defaultValue: 1, allowNull: false}
    });
  }

  const setAssociations = (db) => {
    db.products.belongsTo(db.companies)
    db.products.belongsTo(db.units)
    db.products.belongsTo(db.categories)
    db.products.hasMany(db.productstocks, {onDelete: 'RESTRICT'})
    db.products.hasMany(db.saleitems);
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
              {model: models.productstocks},
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
              {model: models.productstocks},
          ]
      })
  }
  catch (err) {
      throw err
  }
}

const getAllByNameFilter = async(nameFilter) => {
  try {
    const models = require('../models')
    const { Op } = require("sequelize");
    const products = await models.products.findAll({
      where: {
        name: {
          [Op.like]: `%${nameFilter}%`
        }
      },
      include: [
        { model: models.companies },
        { model: models.categories },
        { model: models.units },
        { model: models.productstocks }
      ]
    });
    return products;
  } catch (error) {
    console.error('Error finding products:', error);
    throw error;
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

  const getAllAdmin = async() => {
    try {
      const model = require('../models').products
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
    getAllAdmin,
    getAllByNameFilter
  }