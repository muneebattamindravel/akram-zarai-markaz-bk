const CONTACTS_STRINGS = require('../constants/contacts.strings')
const initialize = (sequelize,Sequelize) => {
    return sequelize.define('contacts', {
      type: {
        type: Sequelize.ENUM, values: [CONTACTS_STRINGS.SUPPLIER, CONTACTS_STRINGS.CUSTOMER],
        allowNull: false
      },
      name: {type: Sequelize.STRING, allowNull: false},
      businessName: {type: Sequelize.STRING, defaultValue: ''},
      number: {type: Sequelize.STRING, defaultValue: ''},
      email: {type: Sequelize.STRING, defaultValue: ''},
      address: {type: Sequelize.STRING, defaultValue: ''},
      notes: {type: Sequelize.STRING, defaultValue: ''},
    });
  }

  const setAssociations = (db) => {
    db.contacts.hasMany(db.sales)
    db.accounts.hasMany(db.contacts)
  }
  
  const create = async (contact) => {
    try {
      const contacts = require('../models').contacts
      return await contacts.create(contact);
    }
    catch(err) {
      throw err
    }
  }
  
  const update = async (body, id) => {
    try {
      const contacts = require('../models').contacts
      return await contacts.update(body, {where: {id:id}}) == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }
  
  const getByID = async(id) => {
    try {
      const contacts = require('../models').contacts
      return await contacts.findByPk(id)
    }
    catch (err) {
      throw err
    }
  }
  
  const getAll = async() => {
    try {
      const contacts = require('../models').contacts
      return await contacts.findAll()
    }
    catch (err) {
      throw err
    }
  }

  const getAllByType = async(ptype) => {
    try {
      const contacts = require('../models').contacts
      return await contacts.findAll({where: {type: ptype}})
    }
    catch (err) {
      throw err
    }
  }
  
  const deleteById = async(id) => {
    try {
      const contacts = require('../models').contacts
      const result = await contacts.destroy({where: {id: id}})
      return result == 1 ? true : false
    }
    catch (err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').contacts
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
    getAllByType,
    deleteById,
    setAssociations,
    getAllAdmin
  }