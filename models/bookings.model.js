const initialize = (sequelize,Sequelize) => {
  return sequelize.define('bookings', {
    totalAmount: {type: Sequelize.FLOAT},
    draftNumber: {type: Sequelize.STRING},
    bookingDate: {type: Sequelize.DATE},
    notes: {type: Sequelize.STRING},
    draftImageURL: {type: Sequelize.STRING},
  });
}

const setAssociations = (db) => {
    db.bookings.belongsTo(db.companies)
}

const create = async (booking) => {
  try {
    const bookings = require('../models').bookings
    return await bookings.create(booking);
  }
  catch(err) {
    throw err
  }
}

const getByID = async(id) => {
  try {
    const bookings = require('../models').bookings
    return await bookings.findByPk(id)
  }
  catch (err) {
    throw err
  }
}

const getAll = async() => {
  try {
    const bookings = require('../models').bookings
    return await bookings.findAll()
  }
  catch (err) {
    throw err
  }
}

module.exports = {
  initialize,
  create,
  getByID,
  getAll,
  setAssociations,
}