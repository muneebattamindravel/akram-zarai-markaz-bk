const initialize = (sequelize,Sequelize) => {
    return sequelize.define('products', {
        name: {type: Sequelize.STRING, allowNull: false},
        salePrice: {
          type: Sequelize.DECIMAL(10,2),
        },
        description: {type: Sequelize.STRING},
        alertQuantity: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        currentStock: {
          type: Sequelize.DECIMAL(10,2),
          defaultValue: 0.00,
        },
        imageURL: {type: Sequelize.STRING},
        nextLotNumber: {type: Sequelize.INTEGER, defaultValue: 1}
    });
  }

  const setAssociations = (db) => {
    db.products.belongsTo(db.companies)
    db.products.belongsTo(db.units)
    db.products.belongsTo(db.categories)
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
            {model: models.companies, attributes: ['id','name','description']},
            {model: models.categories, attributes: ['id','name','description']},
            {model: models.units, attributes: ['id', 'name', 'allowDecimal']}
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
                {model: models.companies, attributes: ['id','name','description']},
                {model: models.categories, attributes: ['id','name','description']},
                {model: models.units, attributes: ['id', 'name', 'allowDecimal']}
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