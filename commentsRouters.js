const express = require('express')
const db = require('./db')

const router = express.Router()


router.get("/:reviewid/:commentid/edit", function(request, response) {
    const id = request.params.commentid

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

router.post("/:reviewid/:commentid/edit", function(request, response) {
    const name = request.body.name
    const body = request.body.body
    const commentid = request.params.commentid
    const reviewid = request.params.reviewid

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
    else if(body.length > response.locals.maxBodyLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(validationErrors.length == 0) {

        db.editComment(name, body, commentid, function(error) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                response.redirect("/reviews/"+reviewid)
            }
        })
    }
    else {
        db.getCommentById(commentid, function(error, comment) {
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

router.post("/:reviewid/write", function(request, response) {
    const name = request.body.name
    const body = request.body.body
    const reviewid = request.params.reviewid
    const currentdate = new Date()
    var currentminute = currentdate.getMinutes()
    
    if (currentminute < 10) {
        currentminute = "0" + currentdate.getMinutes()
    }

    const publishtime = currentdate.getHours() + ":" + currentminute + ", " + currentdate.getDate() + "/" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear()

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
    else if(body.length > response.locals.maxBodyLength) {
        validationErrors.push("Max length of text overridden (5000 symbols)")
    }

    if(validationErrors.length == 0) {
        
        db.getReviewById(reviewid, function(error, review) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                db.writeComment(name, body, publishtime, reviewid, function(error, id) {
                    if(error) {
            
                        response.render("dberror.hbs")        
                    }
                    else {
                        response.redirect("/reviews/"+reviewid)
                    }
                })
            }
        })
    }
    else {
        db.getReviewById(reviewid, function(error, review) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {

                db.getComments(reviewid, function(error, comments) {
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

router.post("/:reviewid/:commentid/delete", function(request, response) {
    const commentid = request.params.commentid
    const reviewid = request.params.reviewid


    if(!response.locals.isLoggedIn) {

        response.redirect("/login")
    }
    else {
        db.deleteComment(commentid, function(error) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {
                response.redirect("/reviews/"+reviewid)
            }
        })
    }
})


module.exports = router