const app = require('express')()
const consign = require('consign')
const db = require('./config/db')
const mongoose = require('mongoose')
const myArgs = Array.from(process.argv).slice(1)

require('./config/mongodb')

app.db = db
app.mongoose = mongoose
app.myArgs = myArgs

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./schedule')
    .then('./config/routes.js')
    .into(app)

app.listen(process.env.PORT || 3000, () => {
    console.log('Backend running...'+ app.myArgs)
})