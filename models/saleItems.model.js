const initialize = (sequelize,Sequelize) => {
    return sequelize.define('saleitems', {
        salePrice: {type: Sequelize.FLOAT},
        lotsUsedJson: {type: Sequelize.TEXT},
        quantity: {type: Sequelize.FLOAT},
    });
  }
  
  const setAssociations = (db) => {
    db.saleitems.belongsTo(db.sales,  {onDelete: 'RESTRICT'})
    db.saleitems.belongsTo(db.products,  {onDelete: 'RESTRICT'})
    db.saleitems.hasMany(db.saleprofits, {onDelete: 'RESTRICT'})
  }
  
  const create = async (saleItem) => {
    try {
      const saleItems = require('../models').saleitems
      return await saleItems.create(saleItem);
    }
    catch(err) {
      throw err
    }
  }

  //delete all sale items of a particular sale
  const deleteSaleItems = async (saleId) => {
    try {
      const SaleItems = require('../models').saleitems
      return await SaleItems.destroy(
          {
            where: {
              saleId: saleId
            }
          }
        );
    }
    catch (err) {
      throw err;
    }
  }

  const update = async (body, id) => {
    try {
      const saleItems = require('../models').saleitems
      return await saleItems.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getAll = async (whereConditions, includeArray) => {
    try {
      const models = require('../models')
      return await models.saleitems.findAll(
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

  
  
  module.exports = {
    initialize,
    create,
    update,
    deleteSaleItems,
    setAssociations,
    getAll,
  }