const initialize = (sequelize, Sequelize) => {
  return sequelize.define('sales', {
    totalAmount: { type: Sequelize.FLOAT },
    discount: { type: Sequelize.FLOAT },
    saleDate: { type: Sequelize.DATEONLY },
    bookNumber: { type: Sequelize.STRING },
    billNumber: { type: Sequelize.STRING },
    returnApplied: { type: Sequelize.BOOLEAN },
    notes: { type: Sequelize.STRING },
  });
}

const setAssociations = (db) => {
  db.sales.belongsTo(db.contacts)
  db.sales.hasMany(db.saleitems);
  db.sales.hasMany(db.saleprofits, { onDelete: 'RESTRICT' })
  db.sales.hasMany(db.salepayments, { onDelete: 'RESTRICT' })
}

const create = async (sale) => {
  try {
    const sales = require('../models').sales
    return await sales.create(sale);
  }
  catch (err) {
    throw err
  }
}

const getAll = async (from, to) => {
  try {
    const { Op } = require("sequelize");
    const sales = require('../models').sales

    return await sales.findAll(
      {
        where: {
          "saleDate": { [Op.between]: [from, to] }
        },
        order: [['saleDate', 'ASC']],
      }
    )
  }
  catch (err) {
    throw err
  }
}

const deleteById = async (id) => {
  try {
    const Sales = require('../models').sales
    return await Sales.destroy(
      {
        where: { id: id }
      }
    )
  }
  catch (err) {
    throw err
  }
}

const getById = async (id) => {
  try {
    const Sales = require('../models').sales
    const Models = require('../models');
    return await Sales.findOne(
      {
        where: { id: id },
        include: [
          {
            model: Models.saleitems,
            model: Models.salepayments
          }
        ]
      }
    )
  }
  catch (err) {
    throw err
  }
}

const getCounterSalesAmount = async (from, to) => {
  try {
    const sales = require('../models').sales
    const Sequelize = require('sequelize');
    const { Op } = require("sequelize");

    return await sales.findAll(
      {
        attributes: [
          [Sequelize.fn('sum', Sequelize.col('totalAmount')), 'amount'],
        ],
        where: { "saleDate": { [Op.between]: [from, to] } },
        groupBy: ['saleDate'],
      }
    );
  }
  catch (err) {
    throw err
  }
}

const update = async (body, id) => {
  try {
    const sales = require('../models').sales
    return await sales.update(body, { where: { id: id } }) == 1 ? true : false
  }
  catch (err) {
    throw err
  }
}

const getAllAdmin = async () => {
  try {
    const model = require('../models').sales
    return await model.findAll()
  }
  catch (err) {
    throw err
  }
}

const search = async (query) => {
  try {
    const sales = require('../models').sales;
    return await sales.findAll({ where: query });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  initialize,
  create,
  getById,
  getAll,
  setAssociations,
  deleteById,
  getCounterSalesAmount,
  update,
  getAllAdmin,
  search,
}