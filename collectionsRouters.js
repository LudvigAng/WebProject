const express = require('express')
const db = require('./db')

const router = express.Router()



router.get("/", function(request, response) {

    db.getCollections(function(error, collections) {
        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            const model = {
                collections
            }

            response.render("collections.hbs", model)
        }
    })
})

router.get("/create", function(request, response) {

    if(!response.locals.isLoggedIn) {
        
        //stay on same page if they are not logged in
        db.getCollections(function(error, collections) {
            if(error) {

                response.render("dberror.hbs")        
            }
            else {
                const model = {
                    notLoggedIn: true,
                    collections
                }
    
                response.render("collections.hbs", model)
            }
        })
    }
    else {

        response.render("create-collection.hbs")
    }
})

router.get("/:id", function(request, response) {

    const id = request.params.id

    db.getCollectionById(id, function(error, collection) {

        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            //fetching all reviews belonging to the collection
            db.getCollectionReviews(id, function(error, reviews) {
                        
                if(error) {
                    
                    response.render("dberror.hbs")        
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

router.get("/:id/edit", function(request, response) {
    const id = request.params.id

    db.getCollectionById(id, function(error, collection) {
        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            const model = {
                collection
            }

            response.render("edit-collection.hbs", model)
        }
    })
})


router.post("/create", function(request, response) {
    const name = request.body.name
    const description = request.body.description
    const color = request.body.color

    const validationErrors = []

    //validating input to make sure server receives correct data
    if(name == "") {
        validationErrors.push("Must enter name of collection")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(description == "") {
        validationErrors.push("Must enter description of collection")
    }
    else if(description.length > response.locals.maxBodyLength) {
        validationErrors.push("Max length of description overridden (5000 symbols)")
    }
    //having a very small description for a collection should be a choice, therefor no min-length is checked


    if(validationErrors.length == 0) {

        db.createCollection(name, description, 0, color, function(error, id) {
            if(error) {
    
                response.render("dberror.hbs")        
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

router.post("/:collectionid/edit", function(request, response) {
    const name = request.body.name
    const description = request.body.description
    const color = request.body.color
    const collectionid = request.params.collectionid

    const validationErrors = []


    if(name == "") {
        validationErrors.push("Must enter name of collection")
    }
    else if(name.length > response.locals.maxNameLength) {
        validationErrors.push("Max length of name overridden (100 symbols)")
    }

    if(description == "") {
        validationErrors.push("Must enter description of collection")
    }
    else if(description.length > response.locals.maxBodyLength) {
        validationErrors.push("Max length of description overridden (5000 symbols)")
    }
    //having a very small description for a collection should be a choice, therefor no min-length is checked

    if(validationErrors.length == 0) {

        db.editCollection(name, description, color, collectionid, function(error) {
            if(error) {
    
                response.render("dberror.hbs")        
            }
            else {

                response.redirect("/collections/"+collectionid)
            }
        }) 
    }
    else {
        db.getCollectionById(collectionid, function(error, collection) {
            if(error) {

                response.render("dberror.hbs")
            }
            else {

                const model = {
                    collection,
                    validationErrors
                }
        
                response.render("edit-collection.hbs", model)
            }
        })
    }
})

router.post("/:collectionid/delete", function(request, response) {
    const collectionid = request.params.collectionid

    db.deleteCollection(collectionid, function(error) {
        if(error) {

            response.render("dberror.hbs")        
        }
        else {
            //changing collectionid attribute in all reviews which belonged to the deleted collection to NULL 
            db.resetCollectionPropertyInReview(collectionid, function(error) {
                if(error) {

                    response.render("dberror.hbs")        
                }
                else {
                    response.redirect("/collections")
                }
            })
        }
    })
})


module.exports = router