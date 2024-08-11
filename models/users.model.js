const initialize = (sequelize,Sequelize) => {
    return sequelize.define('user', {
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  }

  const validate = async (username, password) => {
    try {
        const users = require('../models').users
        const result = await users.findAll({where: {username: username, password: password}})
        return result.length > 0 ? true : false
    }
    catch(err) {
      throw err
    }
  }

  const getAllAdmin = async() => {
    try {
      const model = require('../models').users
      return await model.findAll()
    }
    catch (err) {
      throw err
    }
  }

  module.exports = {
    initialize,
    validate,
    getAllAdmin
  }