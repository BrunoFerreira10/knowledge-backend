const { mongoDb } = require('../env-select')
const mongoose = require('mongoose')
mongoose.connect(mongoDb.connection, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(e => {
        const msg = 'ERROR: Cannot connect to MondoDB!'
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m')
    })
