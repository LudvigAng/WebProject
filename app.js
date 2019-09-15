const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()

app.use(express.static('public'))

app.engine("hbs", expressHandlebars ({
    defaultLayout: "main.hbs"
}))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.get("/", function(request, response){
    response.render("homepage.hbs")
})

app.get("/about", function(request, response){
    response.render("about.hbs")
})

app.get("/contact", function(request, response){
    response.render("contact.hbs")
})

app.get("/write-review", function(request, response){
    const model = {
        validationErrors: []
    }

    response.render("write-review.hbs", model)
})


app.listen(8080)