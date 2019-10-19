const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")


db.run(` 
    CREATE TABLE IF NOT EXISTS reviews (
        reviewid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        author TEXT,
        rating INTEGER,
        publishtime TEXT,
        body TEXT,
        collectionid INTEGER,
        FOREIGN KEY (collectionid) REFERENCES collections(collectionid)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        commentid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        body TEXT,
        publishtime TEXT,
        reviewid INTEGER,
        FOREIGN KEY (reviewid) REFERENCES reviews(reviewid)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS collections (
        collectionid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        noOfReviews INTEGER,
        color TEXT
    )
`)

exports.writeReview = function(name, author, rating, publishtime, body, collectionid, callback) {
    
    const query = "INSERT INTO reviews (name, author, rating, publishtime, body, collectionid) VALUES (?, ?, ?, ?, ?, ?)"
    const values = [name, author, rating, publishtime, body, collectionid]

    db.run(query, values, function(error) {
        callback(error, this.lastID)
    })
}

exports.writeComment = function(name, body, publishtime, reviewid, callback) {

    const query = "INSERT INTO comments (name, body, publishtime, reviewid) VALUES (?, ?, ?, ?)"
    const values = [name, body, publishtime, reviewid]

    db.run(query, values, function(error) {
        callback(error, this.lastID)
    })
}

exports.createCollection = function(name, description, noOfReviews, color, callback) {

    const query = "INSERT INTO collections (name, description, noOfReviews, color) VALUES (?, ?, ?, ?)"
    const values = [name, description, noOfReviews, color]

    db.run(query, values, function(error) {
        callback(error, this.lastID)
    })
}

exports.getComments = function(reviewid, callback) {

    const query = "SELECT * FROM comments WHERE reviewid = ?"
    const values = [reviewid]

    db.all(query, values, function(error, comments) {
        callback(error, comments)
    })
}

exports.getCollectionReviews = function(collectionid, callback) {
    //finds all reviews belonging to a specific collection
    const query = "SELECT * FROM reviews WHERE collectionid = ?"
    const values = [collectionid]

    db.all(query, values, function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getReviews = function(callback) {

    const query = "SELECT * FROM reviews"

    db.all(query, function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getCollections = function(callback) {

    const query = "SELECT * FROM collections"

    db.all(query, function(error, collections) {
        callback(error, collections)
    })
}

exports.getReviewById = function(reviewid, callback) {

    const query = "SELECT * FROM reviews WHERE reviewid = ?"
    const values = [reviewid]

    db.get(query, values, function(error, review) {
        callback(error, review)
    })
}

exports.getCommentById = function(commentid, callback) {

    const query = "SELECT * FROM comments WHERE commentid = ?"
    const values = [commentid]

    db.get(query, values, function(error, comment) {
        callback(error, comment)
    })
}

exports.getCollectionById = function(collectionid, callback) {

    const query = "SELECT * FROM collections WHERE collectionid = ?"
    const values = [collectionid]

    db.get(query, values, function(error, collection) {
        callback(error, collection)
    })
}

exports.deleteReview = function(reviewid, callback) {

    const query = "DELETE FROM reviews WHERE reviewid = ?"
    const values = [reviewid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.editReview = function(name, author, rating, body, collectionid, reviewid, callback) {

    const query = "UPDATE reviews SET name = ?, author = ?, rating = ?, body = ?, collectionid = ? WHERE reviewid = ?"
    const values = [name, author, rating, body, collectionid, reviewid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.editComment = function(name, body, commentid, callback) {

    const query = "UPDATE comments SET name = ?, body = ?  WHERE commentid = ?"
    const values = [name, body, commentid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.editCollection = function(name, description, color, collectionid, callback) {

    const query = "UPDATE collections SET name = ?, description = ?, color = ? WHERE collectionid = ?"
    const values = [name, description, color, collectionid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.increaseCollectionSize = function(collectionid, callback) {
    //increases size of collection by 1 when a review gets assigned to a collection
    const query = "UPDATE collections SET noOfReviews = noOfReviews + 1 WHERE collectionid = ?"
    const values = [collectionid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.decreaseCollectionSize = function(collectionid, callback) {
    //decreases size of collection by 1 when a review switches away from its current collection
    const query = "UPDATE collections SET noOfReviews = noOfReviews - 1 WHERE collectionid = ?"
    const values = [collectionid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.deleteCollection = function(collectionid, callback) {

    const query = "DELETE FROM collections WHERE collectionid = ?"
    const values = [collectionid]

    db.all(query, values, function(error) {
        callback(error)
    })
}

exports.resetCollectionPropertyInReview = function(collectionid, callback) {
    //all reviews belonging to recently deleted collection gets collectionid set to NULL
    const query = "UPDATE reviews SET collectionid = NULL WHERE collectionid = ?"
    const values = [collectionid]

    db.all(query, values, function(error) {
        callback(error)
    })
}

exports.deleteComments = function(reviewid, callback) {

    const query = "DELETE FROM comments WHERE reviewid = ?"
    const values = [reviewid]

    db.all(query, values, function(error) {
        callback(error)
    })
}

exports.deleteComment = function(commentid, callback) {

    const query = "DELETE FROM comments WHERE commentid = ?"
    const values = [commentid]

    db.get(query, values, function(error) {
        callback(error)
    })
}

exports.getNewestReview = function(callback) {
    //finds newest review by getting the review with the biggest reviewid value
    const query = "SELECT * FROM reviews ORDER BY reviewid DESC LIMIT 1"

    db.get(query, function(error, review) {
        callback(error, review)
    })
}

exports.getLargestCollection = function(callback) {
    //finds largest collection by sorting by noOfReviews and selecting the one with biggest value
    const query = "SELECT * FROM collections ORDER BY noOfReviews DESC LIMIT 1"

    db.get(query, function(error, collection) {
        callback(error, collection)
    })
}

