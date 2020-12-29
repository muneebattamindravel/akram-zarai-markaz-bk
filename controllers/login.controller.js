const LOGIN_STRINGS = require('../constants/login.strings');
const Login = require('../models/login.model');
const { Op } = require("sequelize");

/**validate login credentials */
const validateCredentials = async (req, res) => {
    try {
        if (!IsLoginBodyValid(req.body, res))
            return;
        const result = await Login.validate(req.body.username, req.body.password)
        if (result) {
            res.send({message: LOGIN_STRINGS.VALIDATED})
        }
        else {
            res.status(406).send({message: LOGIN_STRINGS.INVALID_CREDENTIALS});
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: LOGIN_STRINGS.ERROR_VALIDATING, stack: err.stack})
    }
}

const IsLoginBodyValid = (body, res) => {
    if (!body.username) {
        res.status(406).send({message: LOGIN_STRINGS.USERNAME_NULL});
        return false;
    }
    if (!body.password) {
        res.status(406).send({message: LOGIN_STRINGS.PASSWORD_NULL});
        return false;
    }
    return true
}

module.exports = {
    validateCredentials
}