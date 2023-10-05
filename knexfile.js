require('dotenv')
  .config({ path: `${__dirname}/.env` });

module.exports[process.env.NODE_ENV || 'dev'] = {
  client: 'pg',
  connection: process.env.DB_CONNECTION,
  pool: {
    min: 1,
    max: 1,
  },
  migrations: {
    tableName: '_migrations',
    directory: './database/migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
};
