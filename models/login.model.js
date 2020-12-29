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
        const login = require('../models').login
        console.log("Username came is "+username)
        console.log("Password came is "+password)
        const result = await login.findAll({where: {username: username, password: password}})
        return result.length > 0 ? true : false
    }
    catch(err) {
      throw err
    }
  }

  module.exports = {
    initialize,
    validate,
  }