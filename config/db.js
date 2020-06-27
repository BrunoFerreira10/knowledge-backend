const config = require('../knexfile')
const knex = require('knex')(config)

// Not so safe database creation
knex.migrate.latest([config])
 
module.exports = knex