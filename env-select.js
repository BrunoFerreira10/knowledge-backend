let envvar = null

switch (process.env.NODE_ENV){
    case 'production':
      envvar = require('./.env')
    break

    case 'test-local':
      envvar = require('./.env.test-local')
    break

    case 'test-remote':
      envvar = require('./.env.test-remote')
    break
}

const env = {...envvar}

module.exports = {
  ...env
}
