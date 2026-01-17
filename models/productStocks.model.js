const initialize = (sequelize, Sequelize) => {
  return sequelize.define('productstocks', {
    lotNumber: { type: Sequelize.INTEGER, allowNull: false },
    batchNumber: { type: Sequelize.STRING },
    invoiceNumber: { type: Sequelize.STRING, allowNull: false },
    expiryDate: { type: Sequelize.DATEONLY },
    costPrice: { type: Sequelize.FLOAT, },
    quantity: { type: Sequelize.FLOAT, },
    initialQuantity: { type: Sequelize.FLOAT, },
    notes: { type: Sequelize.STRING },
  });
}

const setAssociations = (db) => {
  db.productstocks.belongsTo(db.products, { onDelete: 'RESTRICT' })
  db.productstocks.belongsTo(db.purchases, { onDelete: 'RESTRICT' })
}

const create = async (productstock) => {
  try {
    const productstocks = require('.').productstocks
    return await productstocks.create(productstock);
  }
  catch (err) {
    throw err
  }
}

const update = async (body, id) => {
  try {
    const productstocks = require('.').productstocks
    return await productstocks.update(body, { where: { id: id } }) == 1 ? true : false
  }
  catch (err) {
    throw err
  }
}

const getByID = async (id) => {
  try {
    const models = require('.')
    return await models.productstocks.findByPk(id)
  }
  catch (err) {
    throw err
  }
}

const get = async (condition) => {
  try {
    const models = require('.')
    return await models.productstocks.findOne({ where: condition })
  }
  catch (err) {
    throw err
  }
}

const getAll = async (whereConditions, includeArray, order = 'ASC') => {
  try {
    const models = require('.');
    const safeOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    return await models.productstocks.findAll({
      where: whereConditions,
      include: includeArray,
      order: [['id', safeOrder]], // ✅ apply ordering
    });
  } catch (err) {
    throw err;
  }
};


const getByLotNumber = async (productId, lotNumber, includeArray = []) => {
  try {
    const models = require('.');
    return await models.productstocks.findOne({
      where: {
        productId: productId,
        lotNumber: lotNumber
      },
      include: includeArray
    });
  } catch (err) {
    throw err;
  }
};


//delete all productStocks
const deleteAll = async (whereConditions) => {
  try {
    const productStocks = require('.').productstocks
    return await productStocks.destroy(
      {
        where: whereConditions
      }
    );
  }
  catch (err) {
    throw err;
  }
}

const getAllAdmin = async () => {
  try {
    const model = require('../models').productstocks
    return await model.findAll()
  }
  catch (err) {
    throw err
  }
}

module.exports = {
  initialize,
  create,
  setAssociations,
  getByID,
  update,
  get,
  getAll,
  deleteAll,
  getAllAdmin,
  getByLotNumber
}