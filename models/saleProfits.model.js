const initialize = (sequelize,Sequelize) => {
    return sequelize.define('saleprofits', {
        amount: {type: Sequelize.FLOAT},
        date: {type: Sequelize.DATEONLY},
    });
  }
  
  const setAssociations = (db) => {
    db.saleprofits.belongsTo(db.sales)
    db.saleprofits.belongsTo(db.saleitems)
  }
  
  const create = async (saleProfit) => {
    try {
      const SaleProfits = require('../models').saleprofits
      return await SaleProfits.create(saleProfit);
    }
    catch(err) {
      throw err
    }
  }

  //delete all profits posted of a particular sale
  const deleteSaleProfits = async (saleId) => {
    try {
      const SaleProfits = require('../models').saleprofits
      return await SaleProfits.destroy(
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

  const getCounterSalesProfit = async (from, to) => {
    try {
      const SaleProfits = require('../models').saleprofits
      const Sequelize = require('sequelize');
      const { Op } = require("sequelize");

      return await SaleProfits.findAll(
        {
          attributes: [
            [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
          ],
          where : {"date" : {[Op.between] : [from , to ]}},
          groupBy: ['date'],
        }
      );
    }
    catch(err) {
      throw err
    }
  }

  const getAll = async (where) => {
    try {
      const SaleProfits = require('../models').saleprofits
      return await SaleProfits.findAll(where);
    }
    catch(err) {
      throw err
    }
  }

  const getTotalProfitAmountBySaleId = async (saleId) => {
    try {
      const SaleProfits = require('../models').saleprofits
      const Sequelize = require('sequelize');
      
      const response = await SaleProfits.findAll(
        {
          attributes: [
            [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
          ],
          where : {saleId : saleId},
          groupBy: ['saleId'],
        }
      );

      return response[0].amount;
    }
    catch(err) {
      throw err
    }
  }

  const getSaleProfits = async (from, to) => {
    try {
      const SaleProfits = require('../models').saleprofits
      const models = require('../models')
      const { Op } = require("sequelize");

      return await SaleProfits.findAll(
        {
          where : {"date" : {[Op.between] : [from , to ]}},
          include : [
            {
              model: models.sales
            },
            {
              model: models.saleitems,
              include: [
                {
                  model: models.products,
                  include: [
                    {model: models.companies},
                    {model: models.categories},
                  ]
                }
              ]
            }
          ]
        }
      );
    }
    catch(err) {
      throw err
    }
  }
  
  module.exports = {
    initialize,
    create,
    setAssociations,
    getCounterSalesProfit,
    deleteSaleProfits,
    getTotalProfitAmountBySaleId,
    getAll,
    getSaleProfits
  }