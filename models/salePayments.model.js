const initialize = (sequelize,Sequelize) => {
    return sequelize.define('salepayments', {
        receivedAmount: {type: Sequelize.FLOAT},
        receivedDate: {type: Sequelize.DATEONLY},
        paymentType: {type: Sequelize.STRING},
        bookNumber: {type: Sequelize.STRING},
        billNumber: {type: Sequelize.STRING},
    });
  }

  const create = async (salepayment) => {
    try {
      const salepaymentModel = require('.').salepayments
      return await salepaymentModel.create(salepayment);
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async (whereConditions, includeArray) => {
    try {
      const models = require('.')
      return await models.salepayments.findAll(
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
   const deletesalepayments = async (saleId) => {
    try {
      const salepayments = require('.').salepayments
      return await salepayments.destroy(
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
      const salepayments = require('.').salepayments
      const Sequelize = require('sequelize');

      return await salepayments.findAll(
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
    db.salepayments.belongsTo(db.accounts)
  } 

  const getAllAdmin = async() => {
    try {
      const model = require('../models').salepayments
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
    deletesalepayments,
    getTotalPaymentsReceivedAmount,
    getAll,
    getAllAdmin
  }