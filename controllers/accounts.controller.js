const ACCOUNTS_STRINGS = require('../constants/accounts.strings');
const Accounts = require('../models/accounts.model');
const accounttransactionsModel = require('../models/accountTransactions.model');
const { Op } = require("sequelize");
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accounttransactionsController = require('./accountTransactions.controller');

/**creates a new account */
const createAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;

        const account = await Accounts.create({
            createdDate: new Date(),
            name: req.body.name,
            type: req.body.type,
            openingBalance: req.body.openingBalance,
            description: req.body.description,
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
            isDefault: false,
            referenceId: req.body.referenceId == 0 ? null : referenceId,
        })

        await accounttransactionsController.createaccounttransaction(
            new Date(),
            req.body.openingBalance,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.ACCOUNT_CREATED,
            req.body.type,
            account.id,
            account.id, 
            "", 
            "",
            "",
            "");
        res.send(account);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_CREATING_ACCOUNT, stack: err.stack})
    }
}

/**creates a new account - FOR DB MIGRATION*/
const createAccountDBMigration = async (date, name, description, type, openingBalance, referenceId, bankName, bankAccountNumber, isDefault) => {
    try {
        const account = await Accounts.create({
            createdDate: date,
            name: name,
            description: description,
            type: type,
            openingBalance: openingBalance,
            referenceId: referenceId == 0 ? null : referenceId,
            bankName: bankName,
            bankAccountNumber: bankAccountNumber,
            isDefault: isDefault,
        })

        await accounttransactionsController.createaccounttransaction(
            date,
            openingBalance, 
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.ACCOUNT_CREATED,
            type,
            account.id,
            account.id,
            "",
            "",
            "",
            "");

        return account;
    }
    catch (err) {
        return err.message.toString();
    }
}

/**update a account by id*/
const updateAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;
        const result = await Accounts.exists(
            {name: req.body.name, type: req.body.type ,  id: {[Op.not]: req.params.id}}
        )
        if (result) {
            res.status(406).send({message: ACCOUNTS_STRINGS.DUPLICATE_ACCOUNT_NAME})
            return;
        } 

        const updated = await Accounts.update(req.body, req.params.id);
        if (updated) {
            await accounttransactionsController.updateOpeningBalance(req.params.id, req.body.openingBalance);
            res.send({message: ACCOUNTS_STRINGS.ACCOUNT_UPDATED_SUCCESSFULLY})
        }
        else {
            res.status(406).send({message: `${ACCOUNTS_STRINGS.ERROR_UPDATING_ACCOUNT}, id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_UPDATING_ACCOUNT, stack: err.stack})
    }
}

/** get a account with id */
const getAccount = async (req, res) => {
    try {
        const account = await Accounts.getByID(req.params.id)
        if (account) {
            let balance = 0.00
            let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
            if (lastTransaction) 
                balance = lastTransaction.closingBalance;
            account.setDataValue('balance', balance);

            let opening = (await accounttransactionsModel.getFirstTransaction(account.id)).amount;
            account.setDataValue("openingBalance", opening);
            
            res.send(account)
        }
        else {
            res.status(404).send({message: `${ACCOUNTS_STRINGS.ACCOUNT_NOT_FOUND} ,id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

/** get account statement against account id */
const getAccountStatement = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const models = require("../models");

    const accountId = parseInt(req.params.id, 10);
    if (!accountId || Number.isNaN(accountId)) {
      return res.status(400).send({ message: "Invalid accountId" });
    }

    // const from = req.query.from;
    // const to = req.query.to;

    // if (!from || !to) {
    //   return res.status(400).send({ message: "from and to are required (YYYY-MM-DD)" });
    // }

    // const where = {
    //   accountId,
    //   createdAt: {
    //     [Op.between]: [from, to],
    //   },
    // };

    const where = {
      accountId
    };

    const include = [{ model: models.accounts }];

    // Statement display order:
    // - If you want "latest first" (typical): DESC
    // - If you want "oldest first": ASC
    const order = [["id", "ASC"]];

    const accounttransactions = await accounttransactionsModel.getAll(where, include, order);

    res.send(accounttransactions);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      raw: err.message.toString(),
      message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT_STATEMENT,
      stack: err.stack,
    });
  }
};

const consolidateAccountStatement = async (req, res) => {
  try {
    const accountId = parseInt(req.params.id, 10);
    if (!accountId || Number.isNaN(accountId)) {
      return res.status(400).send({ message: "Invalid accountId" });
    }

    const result = await consolidateAccountStatementWorker(accountId);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      raw: err.message?.toString(),
      message: "Error Consolidating",
      stack: err.stack,
    });
  }
};

// /** consolidateAccountStatementsForAllRoute */
// const consolidateAccountStatementForAll = async (req, res) => {
//   try {
//     const allAccounts = await Accounts.getAll();

//     // Do NOT run all at once. Limit concurrency to avoid DB overload.
//     const concurrency = 5; // adjust (3-10). Start with 5.
//     let idx = 0;

//     let ok = 0;
//     let failed = 0;
//     const errors = [];

//     async function worker() {
//       while (idx < allAccounts.length) {
//         const currentIndex = idx++;
//         const account = allAccounts[currentIndex];

//         try {
//           console.log("Consolidating accountId:", account.id);
//           await consolidateAccountStatementWorker(account.id);
//           ok++;
//         } catch (e) {
//           failed++;
//           errors.push({ accountId: account.id, error: e.message });
//         }
//       }
//     }

//     await Promise.all(Array.from({ length: concurrency }, worker));

//     res.send({
//       message: "Done",
//       total: allAccounts.length,
//       ok,
//       failed,
//       errors,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({
//       raw: err.message.toString(),
//       message: "Error Consolidating",
//       stack: err.stack,
//     });
//   }
// };

const consolidateAccountStatementForAll = async (req, res) => {
  try {
    const allAccounts = await Accounts.getAll();

    const concurrency = 5;
    let idx = 0;

    let ok = 0;
    let failed = 0;
    const errors = [];

    async function worker() {
      while (idx < allAccounts.length) {
        const currentIndex = idx++;
        const account = allAccounts[currentIndex];

        try {
          console.log("Consolidating accountId:", account.id);
          await consolidateAccountStatementWorker(account.id);
          ok++;
        } catch (e) {
          failed++;
          errors.push({ id: account.id, error: e.message || String(e) });
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));

    return res.send({
      message: "Done",
      scope: "accounts",
      total: allAccounts.length,
      ok,
      failed,
      errors,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error Consolidating",
      scope: "accounts",
      total: 0,
      ok: 0,
      failed: 0,
      errors: [{ id: -1, error: err.message || String(err) }],
    });
  }
};


const consolidateAccountStatementWorker = async (accountIdRaw) => {
  const accountId = parseInt(accountIdRaw, 10);
  if (!accountId || Number.isNaN(accountId)) {
    throw new Error("Invalid accountId");
  }

  const where = { accountId };
  const include = [];

  // MUST consolidate in insertion order (oldest -> newest)
  const order = [["id", "ASC"]];

  const accounttransactions = await accounttransactionsModel.getAll(where, include, order);

  if (!accounttransactions || accounttransactions.length === 0) {
    return { accountId, updated: 0, message: "No transactions" };
  }

  // Start from 0. If you have an opening balance in accounts table, use it here.
  let closingBalance = 0;

  // Sequential loop (NO Promise.all) — running totals must be sequential
  for (const t of accounttransactions) {
    const amt = Number(t.amount) || 0;
    closingBalance += amt;

    await accounttransactionsModel.update(
      { closingBalance },
      t.id
    );
  }

  console.log("consolidated account statement for account " + accountIdRaw)
  return { accountId, updated: accounttransactions.length };
};

const validateAccountLedger = async (req, res) => {
  try {
    const models = require("../models");

    const accountId = parseInt(req.params.id, 10);
    if (!accountId || Number.isNaN(accountId)) {
      return res.status(400).send({ message: "Invalid accountId" });
    }

    // IMPORTANT: deterministic order
    const txns = await models.accounttransactions.findAll({
      where: { accountId },
      order: [["id", "ASC"]],
    });

    if (!txns.length) return res.send({ ok: true, message: "No transactions" });

    // Start from FIRST ROW's closingBalance to avoid assumptions about opening balance
    // (This makes the test valid even if opening balance isn't stored anywhere)
    let running = Number(txns[0].closingBalance);
    const EPS = 0.01; // float tolerance

    const issues = [];
    for (let i = 1; i < txns.length; i++) {
      const prev = txns[i - 1];
      const curr = txns[i];

      const prevClose = Number(prev.closingBalance) || 0;
      const amt = Number(curr.amount) || 0;

      const expectedClose = prevClose + amt;
      const storedClose = Number(curr.closingBalance) || 0;

      if (Math.abs(storedClose - expectedClose) > EPS) {
        issues.push({
          index: i,
          prevId: prev.id,
          currId: curr.id,
          transactionDate: curr.transactionDate,
          amount: curr.amount,
          prevClosing: prev.closingBalance,
          expectedClosing: expectedClose,
          storedClosing: curr.closingBalance,
          delta: storedClose - expectedClose,
          type: curr.type,
          referenceId: curr.referenceId,
          details: curr.details,
        });

        // stop at first mismatch (most useful for debugging)
        break;
      }

      running = storedClose;
    }

    res.send({
      ok: issues.length === 0,
      accountId,
      transactions: txns.length,
      firstMismatch: issues[0] || null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message, stack: err.stack });
  }
};


/** get balance of the default account */
const getDefaultAccountBalance = async (req, res) => {
    try {
        res.send(await getDefaultAccountBalanceWorker());
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

const getDefaultAccountBalanceWorker = async () => {
    try {
        const account = await Accounts.getDefaultAccount();
        if (account) {
            let balance = 0.00
            let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
            if (lastTransaction) 
                balance = lastTransaction.closingBalance;
            
            const amountObject = {
                amount: balance
            }
            
            return amountObject;
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

/** get all accounts */
const getAllAccounts = async (req, res) => {
    try {
        res.send(await getAllAccountsWorker());
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNTS, stack: err.stack})
    }
}

const getAllAccountsWorker = async () => {
    const where = {}
    const include = []
    let allAccounts = await Accounts.getAll(where, include);

    await Promise.all(allAccounts.map(async (account) => {
        let balance = 0.00
        let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
        if (lastTransaction) 
            balance = lastTransaction.closingBalance;
        
        account.setDataValue('balance', balance);
    }));

    return allAccounts
}

/** delete account by id */
const deleteAccount = async (req, res) => {
    try {
        const id = req.params.id;
        await Accounts.deleteById(req.params.id) ? res.send({message: ACCOUNTS_STRINGS.ACCOUNT_DELETED}) : res.status(406).send({message: `${ACCOUNTS_STRINGS.ACCOUNT_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: ACCOUNTS_STRINGS.ACCOUNT_NOT_DELETED, stack: err.stack})
    }
}

const IsAccountBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: ACCOUNTS_STRINGS.ACCOUNT_NAME_NULL});
        return false;
    }

    if (!body.type) {
        res.status(406).send({message: ACCOUNTS_STRINGS.ACCOUNT_TYPE_NULL});
        return false;
    }
    return true
}

/** add capital for a partner account */
const addCapital = async (req, res) => {
    try {
        //add to partner capital account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.CAPITAL_ADDED,
            req.body.details,
            req.body.partnerAccountId,
            req.body.partnerAccountId,
            "",
            "",
            "",
            "");

            //also add to amount to credit account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.CAPITAL_ADDED,
            req.body.details,
            req.body.creditAccountId,
            req.body.creditAccountId,
            "",
            "",
            "",
            "");

            res.send(req.body)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Adding Capital", stack: err.stack})
    }
}

/** add profit for a partner account */
const addProfit = async (req, res) => {
    try {
        //add to partner profit account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.PROFIT_POSTED,
            req.body.details,
            req.body.partnerAccountId,
            req.body.partnerAccountId,
            "",
            "",
            "",
            "");

            res.send(req.body)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Posting Profit", stack: err.stack})
    }
}

module.exports = {
    createAccount,
    updateAccount,
    getAccount,
    getDefaultAccountBalance,
    getAllAccounts,
    deleteAccount,
    createAccountDBMigration,
    getAccountStatement,
    consolidateAccountStatementWorker,
    consolidateAccountStatement,
    consolidateAccountStatementForAll,
    addCapital,
    addProfit,
    getDefaultAccountBalanceWorker,
    getAllAccountsWorker,
    validateAccountLedger
}