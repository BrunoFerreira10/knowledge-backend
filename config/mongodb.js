const mongoose = require('mongoose')
//mongoose.connect('mongodb://localhost/knowledge_stats', { useNewUrlParser: true })
mongoose.connect(process.env.mongoConnection, { useNewUrlParser: true })
    .catch(e => {
        const msg = 'ERROR: Cannot connect to MondoDB!'
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m')
    })
