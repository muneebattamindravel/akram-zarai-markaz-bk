const initialize = (sequelize, Sequelize) => {
  return sequelize.define('saleprofits', {
    amount: { type: Sequelize.FLOAT },
    date: { type: Sequelize.DATEONLY },
  });
}

const setAssociations = (db) => {
  db.saleprofits.belongsTo(db.sales)
  db.saleprofits.belongsTo(db.saleitems)
}

const create = async (saleprofit) => {
  try {
    const saleprofits = require('.').saleprofits
    return await saleprofits.create(saleprofit);
  }
  catch (err) {
    throw err
  }
}

//delete all profits posted of a particular sale
const deletesaleprofits = async (saleId) => {
  try {
    const saleprofits = require('.').saleprofits
    return await saleprofits.destroy(
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

// const getCounterSalesProfit = async (from, to) => {
//   try {
//     const saleprofits = require('.').saleprofits
//     const Sequelize = require('sequelize');
//     const { Op } = require("sequelize");

//     return await saleprofits.findAll(
//       {
//         attributes: [
//           [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
//         ],
//         where : {"date" : {[Op.between] : [from , to ]}},
//         groupBy: ['date'],
//       }
//     );
//   }
//   catch(err) {
//     throw err
//   }
// }

const getCounterSalesProfit = async (from, to) => {
  try {
    const saleprofits = require('.').saleprofits;
    const Sequelize = require('sequelize');
    const { Op } = require("sequelize");

    return await saleprofits.findOne({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
      ],
      where: { date: { [Op.between]: [from, to] } },
      raw: true
    });
  }
  catch (err) {
    throw err;
  }
};


const getAll = async (where) => {
  try {
    const saleprofits = require('.').saleprofits
    return await saleprofits.findAll(where);
  }
  catch (err) {
    throw err
  }
}

const getTotalProfitAmountBySaleId = async (saleId) => {
  try {
    const saleprofits = require('.').saleprofits
    const Sequelize = require('sequelize');

    const response = await saleprofits.findAll(
      {
        attributes: [
          [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
        ],
        where: { saleId: saleId },
        groupBy: ['saleId'],
      }
    );

    return response[0].amount;
  }
  catch (err) {
    throw err
  }
}

const getsaleprofits = async (from, to) => {
  try {
    const saleprofits = require('.').saleprofits
    const models = require('.')
    const { Op } = require("sequelize");

    return await saleprofits.findAll(
      {
        where: { "date": { [Op.between]: [from, to] } },
        include: [
          {
            model: models.sales
          },
          {
            model: models.saleitems,
            include: [
              {
                model: models.products,
                include: [
                  { model: models.companies },
                  { model: models.categories },
                ]
              }
            ]
          }
        ]
      }
    );
  }
  catch (err) {
    throw err
  }
}

const getAllAdmin = async () => {
  try {
    const model = require('../models').saleprofits
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
  getCounterSalesProfit,
  deletesaleprofits,
  getTotalProfitAmountBySaleId,
  getAll,
  getsaleprofits,
  getAllAdmin
}