const express = require('express')
const db = require('./db')

const router = express.Router()

router.get("/", function(request, response){
    
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

router.get("/write", function(request, response){

    db.getCollections(function(error, collections) {

        if(error) {

        }
        else {

            const model = {
                collections
            }

            response.render("write-review.hbs", model)
        }
    })
})

router.get("/:id", function(request, response) {

    const id = request.params.id

    response.cookie("lastViewedReviewid", id, {httpOnly: true})

    db.getReviewById(id, function(error, review) {

        if(error) {

        }
        else {
            db.getComments(id, function(error, comments) {
                if(error) {

                }
                else {
                    db.getCollectionById(review.collectionid, function(error, collection) {
                        if (error) {

                        }
                        else {

                            const model = {
                                review,
                                comments,
                                collection
                            }
                                    
                            response.render("review.hbs", model)
                        }
                    })

                }
            })
        }
    })
})

router.get("/:id/edit", function(request, response) {
    const id = request.params.id

    db.getReviewById(id, function(error, review) {
        if(error) {

        }
        else {
            db.getCollections(function(error, collections) {
                if(error) {

                }
                else {
                    const model = {
                        review,
                        collections
                    }
        
                    response.render("edit-review.hbs", model)
                }
            })
        }
    })
})

router.post("/:id/edit", function(request, response) {
    const name = request.body.name
    const author = request.body.author
    const rating = request.body.rating
    const body = request.body.body
    const collectionid = request.body.collectionid
    const id = request.params.id

    const validationErrors = []

    db.editReview(name, author, rating, body, collectionid, id, function(error) {
        if(error) {

        }
        else {

            response.redirect("/reviews/"+id)
        }
    })
})

router.post("/:id/delete-comment", function(request, response) {
    const commentid = request.body.commentid
    const id = request.params.id

    console.log(commentid)
    db.deleteComment(commentid, function(error) {
        if(error) {

        }
        else {
            response.redirect("/reviews/"+id)
        }
    })
})

router.get("/:id/delete", function(request, response) {
    const id = request.params.id

    db.deleteReview(id, function(error) {
        if(error) {

        }
        else {
            db.deleteComments(id, function(error) {
                if(error) {

                }
                else {
                    response.redirect("/reviews")
                }
            })
        }
    })
})

router.post("/write", function(request, response){
    const name = request.body.name
    const author = request.body.author
    const rating = request.body.rating
    const body = request.body.body
    const collectionid = request.body.collectionid
    const currentdate = new Date()
    var currentminute = currentdate.getMinutes()

    if (currentminute < 10) {
        currentminute = "0" + currentdate.getMinutes()
    }

    const publishtime = currentdate.getHours() + ":" + currentminute + ", " + currentdate.getDate() + "/" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear()

    const validationErrors = []

    const review = db.getReviewbyNameAndAuthor(name, author, function(error, review) {
        if(error) {

        }
        else if(review) {
            return true
        }
    })

    if (review) {
        validationErrors.push("A review for this is already written")
    }

    if(name == ""){
        validationErrors.push("Must enter name of book")
    }

    if(author == "") {
        validationErrors.push("Must enter name of author")
    }

    if(rating < 1 || rating > 5){
        validationErrors.push("Must enter a rating from 1 to 5")
    }

    if(!response.locals.isLoggedIn) {
        validationErrors.push("You must be logged in to publish")
    }

    if(validationErrors.length == 0) {

        db.writeReview(name, author, rating, publishtime, body, collectionid, function(error, id) {
            if(error) {

            }
            else {

                db.increaseCollectionSize(collectionid, function(error) {
                    if(error) {

                    }
                    else {

                        response.redirect("/reviews/"+id)
                    }
                })
            }
        }) 
    }
    else {
        
        db.getCollections(function(error, collections) {
            if(error) {

            }
            else {
                const model = {
                    validationErrors,
                    collections
                }
        
                response.render("write-review.hbs", model)
            }
        })
    }
})

router.post("/:id", function(request, response) {
    const name = request.body.name
    const body = request.body.body
    const reviewid = request.params.id
    const currentdate = new Date()
    var currentminute = currentdate.getMinutes()
    
    if (currentminute < 10) {
        currentminute = "0" + currentdate.getMinutes()
    }

    const publishtime = currentdate.getHours() + ":" + currentminute + ", " + currentdate.getDate() + "/" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear()

    const validationErrors = []

    db.writeComment(name, body, publishtime, reviewid, function(error, id) {
        if(error) {

        }
        else {
            response.redirect("/reviews/"+reviewid)
        }
    })
})



module.exports = router