const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const csurf = require('csurf')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require('bcrypt')
const reviewsRouter = require('./reviewsRouters')
const collectionsRouter = require("./collectionsRouters")
const commentsRouter = require("./commentsRouters")


const db = require('./db')

const app = express()

const username = 'LudvigA'

//password created using the bcrypt hashSync() method
const password = '$2b$10$koEcdZtckOPxFUy/SqT8oesCMN5/XRFgcGIXVM2042evXgsFCCYX6'

app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(cookieParser())

app.use(expressSession ({
    secret: "iodjom2jw09d0j1209jdio1nd",
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    store: new SQLiteStore()
}))

app.use(csurf({cookie: true}))

app.use(function(request, response, next) {

    const lastViewedReviewId = request.cookies.lastViewedReviewId

    db.getReviewById(lastViewedReviewId, function(error, review) {
        if(error) {

            response.render("dberror.hbs")
        }
        else {

            response.locals.lastViewedReview = review

            next()
        }
    })
})

app.use(function(request, response, next) {
    response.locals.isLoggedIn = request.session.isLoggedIn
    response.locals.lastViewedReviewid = request.session.lastViewedReviewid
    response.locals.csrfToken = request.csrfToken()

    //defining all min- and max-lengths of certain inputs for future validation
    response.locals.minThoughtsLength = 200
    response.locals.maxThoughtsLength = 5000
    response.locals.maxNameLength = 100

    next()
})

app.use("/reviews", reviewsRouter)

app.use("/collections", collectionsRouter)

app.use("/comments", commentsRouter)

app.engine("hbs", expressHandlebars ({
    defaultLayout: "main.hbs"
}))


app.get("/", function(request, response){

    db.getNewestReview(function(error, review) {
        if(error) {

            response.render("dberror.hbs")
        }
        else {
            db.getLargestCollection(function(error, collection) {
                if(error) {

                    response.render("dberror.hbs")
                }
                else {
                    const model = {
                        review,
                        collection
                    }

                    response.render("homepage.hbs", model)
                }
            })
        }
    })
})

app.get("/about", function(request, response){
    response.render("about.hbs")
})

app.get("/contact", function(request, response){
    response.render("contact.hbs")
})

app.get("/logout", function(request, response) {

    const model = {
        logoutHappened: true,
        isLoggedIn: false
    }
    
    request.session.destroy()
    response.render("login.hbs", model)
})

app.get("/login", function(request, response) {

    response.render("login.hbs")
})

app.post("/login", function(request, response) {

    const validationErrors = []

    if(request.body.username != username) {
        validationErrors.push("Wrong username")
    }

    if(!bcrypt.compareSync(request.body.password, password)) {
        validationErrors.push("Wrong password")
    }

    if(request.body.username == username && bcrypt.compareSync(request.body.password, password)) {
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