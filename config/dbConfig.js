const dbConfigAWS = {
  database: 'akram-zarai-markaz',
  username: 'root',
  password: 'INjOXmfcLd+4',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
};

const dbConfigLocal = {
  database: 'akram-zarai-markaz',
  username: 'root',
  password: 'root',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
};

// Choose configuration as needed
const GetLocalDBConfig = () => dbConfigLocal;
const GetSourceDBConfig = () => dbConfigLocal;
const GetTargetDBConfig = () => dbConfigAWS;

// Define upload URL for backups
// const GetUploadURL = () => 'http://localhost:6969/data/upload/';
const GetUploadURL = () => 'http://18.140.71.84:6969/data/upload/';

module.exports = {
    GetLocalDBConfig,
    GetSourceDBConfig,
    GetTargetDBConfig,
    GetUploadURL
};
