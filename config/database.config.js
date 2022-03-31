const dbConfig = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: 'root',
    DB: 'akram-zarai-markaz',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 5,
      acquire: 30000,
      idle: 10000,
    }
  };

  console.log(dbConfig)
  module.exports = dbConfig;