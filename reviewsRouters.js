const express = require('express')
const db = require('./db')

const router = express.Router()

router.get("/", function(request, response){
    
    db.getReviews(function(error, reviews) {
        
        if(error) {
            
            response.render("dberror.hbs")        
        }
        else {
            
            const model = {
                reviews
            }

            response.render("reviews.hbs", model)
        }
    })
})

router.get("/write", function(request, response){

    db.getCollections(function(error, collections) {

        if(error) {

            response.render("dberror.hbs")        
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

    response.cookie("lastViewedReviewId", id, {httpOnly: true})

    db.getReviewById(id, function(error, review) {

        if(error) {

            response.render("dberror.hbs")        
        }

        else {
            //finds associated comments and collection
            db.getComments(id, function(error, comments) {
                if(error) {

                    response.render("dberror.hbs")        
                }
                else {
                    db.getCollectionById(review.collectionid, function(error, collection) {
                        if(error) {

                            response.render("dberror.hbs")        
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

            response.render("dberror.hbs")        
        }
        else {
            db.getCollections(function(error, collections) {
                if(error) {

                    response.render("dberror.hbs")        
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

router.post("/:reviewId/edit", function(request, response) {
    const name = request.body.name
    const author = request.body.author
    const rating = request.body.rating
    const body = request.body.body
    const newCollectionId = request.body.collectionId
    const id = request.params.reviewId

    const validationErrors = []

    //validating input
    if(name == "") {
        validationErrors.push("Must enter name of book")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(author == "") {
        validationErrors.push("Must enter name of author")
    }
    else if(author.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of author name overridden (100 symbols)")
    }

    if(body == "") {
        validationErrors.push("Must write something about your thoughts of the book")
    }
    else if(body.length < response.locals.minThoughtsLength) {
        validationErrors.push("Min length of text not met (300 symbols)")
    }
    else if(body.length > response.locals.maxThoughtsLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(rating == undefined){
        validationErrors.push("Must give the book a rating")
    }

    if(validationErrors.length == 0) {
        db.getReviewById(id, function(error, review) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {
                //check to see if the review's collection is the same, undefined or changed to other collection
                if(newCollectionId == undefined) {
                    
                    db.decreaseCollectionSize(review.collectionid, function(error) {
                        if(error) {
                
                            response.render("dberror.hbs")        
                        }
                    })
                }
                else if(newCollectionId == review.collectionid) {
                    return
                }
                else {
                    db.increaseCollectionSize(newCollectionId, function(error) {
                        if(error) {

                            response.render("dberror.hbs")        
                        }
                        else {
                            db.decreaseCollectionSize(review.collectionid, function(error) {
                                if(error) {

                                    response.render("dberror.hbs")        
                                }
                            })
                        }
                    })
                }
            }
        })

        db.editReview(name, author, rating, body, newCollectionId, id, function(error) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                response.redirect("/reviews/"+id)
            }
        })
    }
    else {
        db.getReviewById(id, function(error, review) {
            if(error) {
    
                response.render("dberror.hbs")        
            }
            else {
                db.getCollections(function(error, collections) {
                    if(error) {
    
                        response.render("dberror.hbs")        
                    }
                    else {
                        const model = {
                            review,
                            collections,
                            validationErrors
                        }
            
                        response.render("edit-review.hbs", model)
                    }
                })
            }
        })
    }
})

router.post("/:reviewId/delete", function(request, response) {
    const id = request.params.reviewId

    db.getReviewById(id, function(error, review) {
        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            //a collection will lose one member because of the deleted review
            db.decreaseCollectionSize(review.collectionid, function(error) {
                if(error) {

                    response.render("dberror.hbs")        
                }
            })
        }
    })

    db.deleteReview(id, function(error) {
        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            db.deleteComments(id, function(error) {
                if(error) {

                    response.render("dberror.hbs")        
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
    const collectionId = request.body.collectionId
    const currentDate = new Date()
    var currentMinute = currentDate.getMinutes()

    const validationErrors = []

    //if the amount of minutes when POST request is handled is between 0 - 10 minutes, the 0 supposed to be in front of the other
    //digit is normally not visible. 15:07 becomes 15:7 for example. Code checks if that is the case. If so, a 0 will be added
    //to display minutes correctly.
    if (currentMinute < 10) {
        currentMinute = "0" + currentDate.getMinutes()
    }

    //combining results of Date functions to construct time string to be stored in DB
    const publishTime = currentDate.getHours() + ":" + currentMinute + ", " + currentDate.getDate() + "/" + (currentDate.getMonth()+1) + "/" + currentDate.getFullYear()

    //validating input

    if(name == "") {
        validationErrors.push("Must enter name of book")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(author == "") {
        validationErrors.push("Must enter name of author")
    }
    else if(author.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of author name overridden (100 symbols)")
    }

    if(body == "") {
        validationErrors.push("Must write something about your thoughts of the book")
    }
    else if(body.length < response.locals.minThoughtsLength) {
        validationErrors.push("Min length of text not met (300 symbols)")
    }
    else if(body.length > response.locals.maxThoughtsLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(rating == undefined){
        validationErrors.push("Must give the book a rating")
    }

    if(!response.locals.isLoggedIn) {
        validationErrors.push("You must be logged in to publish")
    }

    if(validationErrors.length == 0) {

        db.writeReview(name, author, rating, publishTime, body, collectionId, function(error, id) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                db.increaseCollectionSize(collectionId, function(error) {
                    if(error) {

                        response.render("dberror.hbs")        
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

                response.render("dberror.hbs")        
            }
            else {
                const model = {
                    validationErrors,
                    collections,
                }
        
                response.render("write-review.hbs", model)
            }
        })
    }
})


module.exports = router