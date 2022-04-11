const initialize = (sequelize,Sequelize) => {
    return sequelize.define('salePayments', {
        receivedAmount: {type: Sequelize.FLOAT},
        receivedDate: {type: Sequelize.DATEONLY},
        paymentType: {type: Sequelize.STRING},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
    });
  }

  const create = async (salePayment) => {
    try {
      const salePaymentModel = require('../models').salePayments
      return await salePaymentModel.create(salePayment);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async (whereConditions, includeArray) => {
    try {
      const models = require('../models')
      return await models.salePayments.findAll(
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
  
   //delete all payments posted of a particular sale
   const deleteSalePayments = async (saleId) => {
    try {
      const SalePayments = require('../models').salePayments
      return await SalePayments.destroy(
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

  const getTotalPaymentsReceivedAmount = async (saleId) => {
    try {
      const SalePayments = require('../models').salePayments
      const Sequelize = require('sequelize');

      return await SalePayments.findAll(
        {
          attributes: [
            [Sequelize.fn('sum', Sequelize.col('receivedAmount')), 'receivedAmount'],
          ],
          where : {"saleId" : saleId},
          groupBy: ['saleId'],
        }
      );
    }
    catch(err) {
      throw err
    }
  }

  const setAssociations = (db) => {
    db.salePayments.belongsTo(db.accounts)
  } 
  
  module.exports = {
    initialize,
    create,
    setAssociations,
    deleteSalePayments,
    getTotalPaymentsReceivedAmount,
    getAll
  }