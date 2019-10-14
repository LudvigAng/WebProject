const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const csurf = require('csurf')
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
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    store: new SQLiteStore()
}))

app.use(csurf({cookie: true}))

app.use(function(request, response, next) {
    response.locals.isLoggedIn = request.session.isLoggedIn
    response.locals.lastViewedReviewid = request.session.lastViewedReviewid
    response.locals.csrfToken = request.csrfToken()
    
    next()
})

app.use("/reviews", reviewsRouter)

app.engine("hbs", expressHandlebars ({
    defaultLayout: "main.hbs"
}))


app.get("/", function(request, response){

    db.getNewestReview(function(error, review) {
        if(error) {

        }
        else {
            const model = {
                review
            }

            response.render("homepage.hbs", model)
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

app.get("/collections", function(request, response) {

    db.getCollections(function(error, collections) {
        if(error) {
            const model = {
                errorHappened: true,
            }

            response.render("collections.hbs", model)
        }
        else {
            const model = {
                errorHappened: false,
                collections
            }

            response.render("collections.hbs", model)
        }
    })
})

app.get("/collections/create", function(request, response) {

    response.render("create-collection.hbs")
})

app.get("/collections/:id", function(request, response) {

    const id = request.params.id

    db.getCollectionById(id, function(error, collection) {

        if(error) {

        }
        else {

            db.getCollectionReviews(id, function(error, reviews) {
                        
                if(error) {
        
                }
                else {
                    
                    const model = {
                        collection,
                        reviews
                    }
        
                    response.render("collection.hbs", model)
                }
            })           
        }
    })
})

app.post("/collections/:id/delete", function(request, response) {
    const collectionid = request.body.collectionid

    db.deleteCollection(collectionid, function(error) {
        if(error) {

        }
        else {
            db.resetCollectionPropertyInReview(collectionid, function(error) {
                if(error) {

                }
                else {
                    response.redirect("/collections")
                }
            })
        }
    })
})

app.get("/collections/:id/edit", function(request, response) {
    const id = request.params.id

    db.getCollectionById(id, function(error, collection) {
        if(error) {

        }
        else {
            const model = {
                collection
            }

            response.render("edit-collection.hbs", model)
        }
    })
})

app.post("/collections/:id/edit", function(request, response) {
    const name = request.body.name
    const description = request.body.description
    const color = request.body.color
    const collectionid = request.params.id

    const validationErrors = []

    db.editCollection(name, description, color, collectionid, function(error) {
        if(error) {

        }
        else {

            response.redirect("/collections/"+collectionid)
        }
    })})

app.post("/collections/create", function(request, response) {
    const name = request.body.name
    const description = request.body.description
    const color = request.body.color

    const validationErrors = []


    if(validationErrors.length == 0) {

        db.createCollection(name, description, 0, color, function(error, id) {
            if(error) {
    
            }
            else {
                response.redirect("/collections/"+id)
            }
        }) 
    }
    else {

        const model = {
            validationErrors
        }

        response.render("create-collection.hbs", model)
    }
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