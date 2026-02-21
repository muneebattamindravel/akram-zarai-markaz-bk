const salesController = require('./sales.controller');
const profitsController = require('./profits.controller');
const accountsController = require('./accounts.controller');
const productStocksModel = require('../models/productStocks.model');

const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require('../models');
const db = require('../models');
const { saleitems, sales, products, contacts, saleprofits, salereturns, units } = db;

const { QueryTypes } = require("sequelize");

// const getTopBarData = async (req, res) => {
//   try {

//     const todaySale = await salesController.getCounterSaleAmountWorker(req.query.from, req.query.to);
//     const todayProfit = await profitsController.getCounterSaleProfitAmountWorker(req.query.from, req.query.to);

//     const cashAmount = await accountsController.getDefaultAccountBalanceWorker();
//     let topBarData = {
//       "todaySale": todaySale.amount,
//       "todayProfit": todayProfit.amount,
//       "totalCash": cashAmount.amount
//     }
//     res.send(topBarData);
//   }
//   catch (err) {
//     console.log(err)
//     res.status(500).send({ raw: err.message.toString(), message: "Error Fetching Top Bar Data", stack: err.stack })
//   }
// }

const getTopBarData = async (req, res) => {
  try {
    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    const from = req.query.from;
    const to = req.query.to;

    const todaySaleObj = await salesController.getCounterSaleAmountWorker(from, to);
    const todayProfitObj = await profitsController.getCounterSaleProfitAmountWorker(from, to);
    const cashAmountObj = await accountsController.getDefaultAccountBalanceWorker();

    const topBarData = {
      todaySale: round2(todaySaleObj?.amount),
      todayProfit: round2(todayProfitObj?.amount),
      totalCash: round2(cashAmountObj?.amount),
    };

    return res.send(topBarData);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      raw: err.message.toString(),
      message: "Error Fetching Top Bar Data",
      stack: err.stack,
    });
  }
};

const getBusinessReport = async (req, res) => {
  try {
    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    // 1) Get totals by account type using latest closingBalance per account (fallback openingBalance)
    const rows = await db.sequelize.query(
      `
      SELECT
        a.type,
        ROUND(SUM(COALESCE(latest.closingBalance, a.openingBalance, 0)), 2) AS total
      FROM accounts a
      LEFT JOIN (
        SELECT t1.accountId, t1.closingBalance
        FROM accounttransactions t1
        INNER JOIN (
          SELECT accountId, MAX(id) AS maxId
          FROM accounttransactions
          GROUP BY accountId
        ) t2 ON t2.accountId = t1.accountId AND t2.maxId = t1.id
      ) AS latest
      ON latest.accountId = a.id
      GROUP BY a.type;
      `,
      { type: QueryTypes.SELECT }
    );

    // defaults
    let totalCashAmount = 0;
    let totalBankAmount = 0;
    let amountInCompanies = 0;
    let customerLoansAmount = 0;
    let totalCapitalAmount = 0;

    for (const r of rows) {
      const v = round2(r.total);
      if (r.type === "Cash") totalCashAmount = v;
      else if (r.type === "Online") totalBankAmount = v;
      else if (r.type === "Company") amountInCompanies = v;
      else if (r.type === "Customer") customerLoansAmount = v;
      else if (r.type === "Partner") totalCapitalAmount = v;
    }

    // 2) Stock total from productstocks (DB-summed inside your model)
    const totalStockAmount = round2(await productStocksModel.getTotalStockAmount());

    // 3) Build consistent response (all rounded)
    const businessReport = {
      totalCashAmount: round2(totalCashAmount),
      totalBankAmount: round2(totalBankAmount),
      amountInCompanies: round2(amountInCompanies),
      customerLoansAmount: round2(customerLoansAmount),
      totalStockAmount: round2(totalStockAmount),
      totalCapitalAmount: round2(totalCapitalAmount),

      // Total shown in your Unity UI (excluding Partner/Capital like your existing logic)
      totalAmount: round2(
        totalCashAmount +
          totalBankAmount +
          amountInCompanies +
          customerLoansAmount +
          totalStockAmount
      ),
    };

    return res.send(businessReport);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      raw: err.message.toString(),
      message: "Error Fetching Business Report",
      stack: err.stack,
    });
  }
};

const getTopLoans = async (req, res) => {
  try {
    let accounts = await accountsController.getAllAccountsWorker();
    accounts = accounts.filter(CustomerFilter);
    res.send(accounts);
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ raw: err.message.toString(), message: "Error Fetching Business Report", stack: err.stack })
  }
}

function CustomerFilter(account) {
  return account.type === "Customer"
}

const getTopSellingProductsThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const results = await saleitems.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalQuantity']
      ],
      include: [
        {
          model: sales,
          attributes: [],
          where: {
            saleDate: { [Op.between]: [start, end] }
          }
        },
        {
          model: products,
          attributes: ['name'],
          include: [{
            model: db.units,
            attributes: ['name']
          }]
        }
      ],
      group: ['productId', 'product.id', 'product.unit.id'],
      order: [[literal('totalQuantity'), 'DESC']],
      limit: 10
    });

    res.send(results.map(r => ({
      productId: r.productId,
      productName: r.product?.name || 'Unknown',
      quantitySold: parseFloat(r.get('totalQuantity')),
      unit: r.product?.unit?.name || '-'
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching top products', raw: err.message });
  }
};


const getTopSellingProductsAllTime = async (req, res) => {
  try {
    const results = await db.saleitems.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalQuantity']
      ],
      include: [
        {
          model: db.products,
          attributes: ['name'],
          include: [
            {
              model: db.units,
              attributes: ['name']
            }
          ]
        }
      ],
      group: ['productId', 'product.id', 'product.unit.id'],
      order: [[literal('totalQuantity'), 'DESC']],
      limit: 20
    });

    res.send(results.map(r => ({
      productId: r.productId,
      productName: r.product?.name || 'Unknown',
      quantitySold: parseFloat(r.get('totalQuantity')),
      unit: r.product?.unit?.name || '-'
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching all-time top products', raw: err.message });
  }
};

const getTopCustomersAllTime = async (req, res) => {
  try {
    const results = await sales.findAll({
      attributes: [
        'contactId',
        [fn('SUM', col('totalAmount')), 'totalSpent']
      ],
      where: {
        contactId: { [Op.ne]: 0 }
      },
      include: [{
        model: contacts,
        attributes: ['name', 'number']
      }],
      group: ['contactId', 'contact.id'],
      order: [[literal('totalSpent'), 'DESC']],
      limit: 20
    });

    res.send(results.map(r => ({
      contactId: r.contactId,
      name: r.contact?.name || 'Unknown',
      number: r.contact?.number || '-',
      totalSpent: parseFloat(r.get('totalSpent'))
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching top customers', raw: err.message });
  }
};

const getTopProfitableProducts = async (req, res) => {
  try {
    const results = await saleprofits.findAll({
      attributes: [
        [col('saleitem.product.id'), 'productId'],
        [col('saleitem.product.name'), 'productName'],
        [fn('SUM', col('saleprofits.amount')), 'totalProfit']
      ],
      include: [
        {
          model: saleitems,
          attributes: [],
          include: [{
            model: products,
            attributes: []
          }]
        }
      ],
      group: ['saleitem.product.id', 'saleitem.product.name'],
      order: [[literal('totalProfit'), 'DESC']],
      limit: 20,
      raw: true
    });

    res.send(results.map(r => ({
      productId: r.productId,
      productName: r.productName,
      totalProfit: parseFloat(r.totalProfit)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Error fetching top profitable products',
      raw: err.message
    });
  }
};

const getMostReturnedProducts = async (req, res) => {
  try {
    const results = await salereturns.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalReturned']
      ],
      include: [{
        model: products,
        attributes: ['name'],
        include: [{
          model: units,
          attributes: ['name']
        }]
      }],
      group: ['productId', 'product.id', 'product.unit.id'],
      order: [[literal('totalReturned'), 'DESC']],
      limit: 15
    });

    res.send(results.map(r => ({
      productId: r.productId,
      productName: r.product?.name || 'Unknown',
      unit: r.product?.unit?.name || '',
      totalReturned: parseFloat(r.get('totalReturned'))
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Error fetching most returned products',
      raw: err.message
    });
  }
};

const getMostProfitableCompaniesByPercentage = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        c.id AS companyId,
        c.name AS companyName,
        SUM(sp.amount) AS totalProfit,
        SUM(si.quantity * si.salePrice) AS totalRevenue,
        (SUM(sp.amount) / SUM(si.quantity * si.salePrice)) * 100 AS profitPercentage
      FROM saleprofits sp
      JOIN saleitems si ON sp.saleitemId = si.id
      JOIN products p ON si.productId = p.id
      JOIN companies c ON p.companyId = c.id
      GROUP BY c.id, c.name
      ORDER BY profitPercentage DESC
      LIMIT 20;
    `);

    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Error fetching most profitable companies by %',
      raw: err.message,
    });
  }
};

module.exports = {
  getTopBarData,
  getBusinessReport,
  getTopLoans,
  getTopSellingProductsThisMonth,
  getTopSellingProductsAllTime,
  getTopCustomersAllTime,
  getTopProfitableProducts,
  getMostReturnedProducts,
  getMostProfitableCompaniesByPercentage
}