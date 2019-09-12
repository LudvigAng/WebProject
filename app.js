const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

app.use(express.static('public'))

app.engine("hbs", expressHandlebars ({
    defaultLayout: "main.hbs"
}))



















app.listen(8000)