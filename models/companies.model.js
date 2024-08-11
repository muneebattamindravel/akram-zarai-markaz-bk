const initialize = (sequelize,Sequelize) => {
  return sequelize.define('companies', {
    name: {
      type: Sequelize.STRING,
      unique: true,
    },
    description: {
      type: Sequelize.STRING
    },
    number: {
      type: Sequelize.STRING
    },
  });
}

const setAssociations = (db) => {
  db.companies.hasMany(db.products, {onDelete: 'RESTRICT'})
  db.companies.hasMany(db.bookings, {onDelete: 'RESTRICT'})
  db.accounts.hasMany(db.companies)
}

const create = async (company) => {
  try {
    const companies = require('../models').companies
    return await companies.create(company);
  }
  catch(err) {
    throw err
  }
}

const update = async (body, id) => {
  try {
    const companies = require('../models').companies
    return await companies.update(body, {where: {id:id}}) == 1 ? true : false
  }
  catch (err) {
    throw err
  }
}

const getByID = async(id) => {
  try {
    const companies = require('../models').companies
    return await companies.findByPk(id)
  }
  catch (err) {
    throw err
  }
}

const exists = async(conditions) => {
  try {
    const companies = require('../models').companies
    const result = await companies.findAll({where: conditions})
    return result.length > 0 ? true : false
  }
  catch (err) {
    throw err
  }
}

const getAll = async() => {
  try {
    const companies = require('../models').companies
    return await companies.findAll()
  }
  catch (err) {
    throw err
  }
}

const deleteById = async(id) => {
  try {
    const companies = require('../models').companies
    const result = await companies.destroy({where: {id: id}})
    return result == 1 ? true : false
  }
  catch (err) {
    throw err
  }
}

const getAllAdmin = async() => {
  try {
    const model = require('../models').companies
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