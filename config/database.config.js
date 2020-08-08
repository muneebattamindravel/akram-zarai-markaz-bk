const dbConfig = {
    HOST: process.env.HOST,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    DB: process.env.DATABASE,
    dialect: process.env.DIALECT,
    pool: {
      max: parseInt(process.env.MAX_POOL),
      min: parseInt(process.env.MIN_POOL),
      acquire: parseInt(process.env.ACQUIRE),
      idle: parseInt(process.env.IDLE),
    }
  };

  console.log(dbConfig)
  module.exports = dbConfig;