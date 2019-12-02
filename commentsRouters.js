const express = require('express')
const db = require('./db')

const router = express.Router()


router.get("/:reviewId/:commentId/edit", function(request, response) {
    const id = request.params.commentId

    if(!response.locals.isLoggedIn) {

        response.redirect("/login")
    }
    else {
        db.getCommentById(id, function(error, comment) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                const model = {
                    comment
                }

                response.render("edit-comment.hbs", model)
            }
        })
    }
})

router.post("/:reviewId/:commentId/edit", function(request, response) {
    const name = request.body.name
    const body = request.body.body
    const commentId = request.params.commentId
    const reviewId = request.params.reviewId

    const validationErrors = []

    //validating input
    if(name == "") {
        validationErrors.push("Must enter your name")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(body == "") {
        validationErrors.push("Must enter a message")
    }
    else if(body.length > response.locals.maxThoughtsLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(validationErrors.length == 0) {

        db.editComment(name, body, commentId, function(error) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                response.redirect("/reviews/"+reviewId)
            }
        })
    }
    else {
        db.getCommentById(commentId, function(error, comment) {
            if(error) {
                
                response.render("dberror.hbs")
            }
            else {

                const model = {
                    comment,
                    validationErrors
                }
        
                response.render("edit-comment.hbs", model)
            }
        })
    }
})

router.post("/:reviewId/write", function(request, response) {
    const name = request.body.name
    const body = request.body.body
    const reviewId = request.params.reviewId
    const currentDate = new Date()
    var currentMinute = currentDate.getMinutes()
    
    if (currentMinute < 10) {
        currentMinute = "0" + currentDate.getMinutes()
    }

    const publishTime = currentDate.getHours() + ":" + currentMinute + ", " + currentDate.getDate() + "/" + (currentDate.getMonth()+1) + "/" + currentDate.getFullYear()

    const validationErrors = []

    //validating input

    if(name == "") {
        validationErrors.push("Must enter your name")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(body == "") {
        validationErrors.push("Must enter a message")
    }
    else if(body.length > response.locals.maxThoughtsLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(validationErrors.length == 0) {
        
        db.getReviewById(reviewId, function(error, review) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                db.writeComment(name, body, publishTime, reviewId, function(error, id) {
                    if(error) {
            
                        response.render("dberror.hbs")        
                    }
                    else {
                        response.redirect("/reviews/"+reviewId)
                    }
                })
            }
        })
    }
    else {
        db.getReviewById(reviewId, function(error, review) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                db.getComments(reviewId, function(error, comments) {
                    if(error) {
        
                        response.render("dberror.hbs")        
                    }
                    else {
        
                        db.getCollectionById(review.collectionid, function(error, collection) {
                            if (error) {
        
                                response.render("dberror.hbs")        
                            }
                            else {
        
                                const model = {
                                    review,
                                    comments,
                                    collection,
                                    validationErrors
                                }
                                        
                                response.render("review.hbs", model)
                            }
                        })
        
                    }
                })
            }
        })
    }
})

router.post("/:reviewId/:commentId/delete", function(request, response) {
    const commentId = request.params.commentId
    const reviewId = request.params.reviewId


    if(!response.locals.isLoggedIn) {

        response.redirect("/login")
    }
    else {
        db.deleteComment(commentId, function(error) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {
                response.redirect("/reviews/"+reviewId)
            }
        })
    }
})


module.exports = router