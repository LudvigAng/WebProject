const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./db')

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

app.get("/reviews", function(request, response){
    
    db.getReviews(function(error, reviews) {
        
        if(error) {
            
            const model = {
                errorHappened: true
            }

            response.render("reviews.hbs", model)
        }
        else {
            
            const model = {
                errorHappened: false,
                reviews
            }

            response.render("reviews.hbs", model)
        }
    })
})

app.get("/reviews/:id", function(request, response) {

        const id = request.params.id

        db.getReviewById(id, function(error, review) {

            if(error) {

            }
            else {
                const model = {
                    review
                }

                response.render("review.hbs", model)
            }
        })
})



app.post("/write-review", function(request, response){
    const name = request.body.name
    const rating = request.body.rating
    const body = request.body.body

    const validationErrors = []

    if(name == ""){
        validationErrors.push("Must enter name of book")
    }

    if(rating < 1 || rating > 5){
        validationErrors.push("Must enter a rating from 1 to 5")
    }


    if(validationErrors.length == 0) {

        db.writeReview(name, rating, body, function(error, reviewid) {
            if(error) {

            }
            else {
                response.redirect("/reviews/"+id)
            }
        }) 
    }
    else {

        const model = {
            validationErrors
        }

        response.render("write-review.hbs", model)
    }
})

app.listen(8080)