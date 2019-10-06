const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const reviewsRouter = require('./reviewsRouters')


const db = require('./db')

const app = express()

const username = "LudvigA"
const password = "secret"

app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(cookieParser())

app.use(expressSession ({
    secret: "iodjom2jw09d0j1209jdio1nd",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore()
}))

app.use(function(request, response, next) {
    response.locals.isLoggedIn = request.session.isLoggedIn
    response.locals.lastViewedReviewid = request.session.lastViewedReviewid
    
    next()
})

app.use("/reviews", reviewsRouter)

app.engine("hbs", expressHandlebars ({
    defaultLayout: "main.hbs"
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

app.get("/logout", function(request, response) {
    request.session.destroy()
    response.redirect("/")
})

app.get("/login", function(request, response) {

    response.render("login.hbs")
})

app.post("/login", function(request, response) {
    
    const validationErrors = []

    if(request.body.username != username) {
        validationErrors.push("Wrong username")
    }

    if(request.body.password != password) {
        validationErrors.push("Wrong passwword")
    }

    if(request.body.username == username && request.body.password == password) {
            request.session.isLoggedIn = true
            response.redirect("/")
    }
    else {
        const model = {
            validationErrors
        }

        response.render("login.hbs", model)
    }
})


app.listen(8080)