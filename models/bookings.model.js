const initialize = (sequelize,Sequelize) => {
  return sequelize.define('bookings', {
    totalAmount: {type: Sequelize.FLOAT},
    prNumber: {type: Sequelize.STRING},
    bookingDate: {type: Sequelize.DATEONLY},
    notes: {type: Sequelize.STRING},
    policyName: {type: Sequelize.STRING},
    policyPercentage: {type: Sequelize.STRING},
    netRate: {type: Sequelize.STRING},
    bookingType: {type: Sequelize.STRING},
    policyType: {type: Sequelize.STRING}
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
    const models = require('../models')
    return await models.bookings.findByPk(id, {include: [{model: models.companies}]})
  }
  catch (err) {
    throw err
  }
}

const getAll = async() => {
  try {
    const bookings = require('../models').bookings
    const models = require('../models')
    
    return await bookings.findAll(
      {
        include: [{model: models.companies}]
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
  getByID,
  getAll,
  setAssociations,
}