const USERS_STRINGS = require('../constants/users.strings');
const User = require('../models/users.model');
const accounttransactions = require('./accountTransactions.controller')

/**validate login credentials */
const validateCredentials = async (req, res) => {
    try {
        if (!IsUserBodyValid(req.body, res))
            return;
        const result = await User.validate(req.body.username, req.body.password)
        if (result) {
            res.send({message: USERS_STRINGS.VALIDATED})
        }
        else {
            res.status(406).send({message: USERS_STRINGS.INVALID_CREDENTIALS});
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: USERS_STRINGS.ERROR_VALIDATING, stack: err.stack})
    }
}

const IsUserBodyValid = (body, res) => {
    if (!body.username) {
        res.status(406).send({message: USERS_STRINGS.USERNAME_NULL});
        return false;
    }
    if (!body.password) {
        res.status(406).send({message: USERS_STRINGS.PASSWORD_NULL});
        return false;
    }
    return true
}

module.exports = {
    validateCredentials
}