const dotenv = require('dotenv')
const { resolve } = require('path')
dotenv.config({ path: resolve(__dirname, './local.env') })

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  entities: [`${__dirname}/build/entities/**/*.js`],
  migrations: [`${__dirname}/build/migration/**/*.js`],
  subscribers: [`${__dirname}/build/subscriber/**/*.js`],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
}
