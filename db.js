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

    db.run("INSERT INTO reviews (name, author, rating, publishtime, body, collectionid) VALUES (?, ?, ?, ?, ?, ?)", [name, author, rating, publishtime, body, collectionid], function(error) {
        callback(error, this.lastID)
    })
}

exports.writeComment = function(name, body, publishtime, reviewid, callback) {

    db.run("INSERT INTO comments (name, body, publishtime, reviewid) VALUES (?, ?, ?, ?)", [name, body, publishtime, reviewid], function(error) {
        callback(error, this.lastID)
    })
}

exports.createCollection = function(name, description, noOfReviews, color, callback) {
    db.run("INSERT INTO collections (name, description, noOfReviews, color) VALUES (?, ?, ?, ?)", [name, description, noOfReviews, color], function(error) {
        callback(error, this.lastID)
    })
}

exports.getComments = function(reviewid, callback) {

    db.all("SELECT * FROM comments WHERE reviewid = ?", [reviewid], function(error, comments) {
        callback(error, comments)
    })
}

exports.getCollectionReviews = function(collectionid, callback) {

    db.all("SELECT * FROM reviews WHERE collectionid = ?", [collectionid], function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getReviews = function(callback) {

    db.all("SELECT * FROM reviews", function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getCollections = function(callback) {
    db.all("SELECT * FROM collections", function(error, collections) {
        callback(error, collections)
    })
}

exports.getReviewById = function(id, callback) {

    db.get("SELECT * FROM reviews WHERE reviewid = ?", [id], function(error, review) {
        callback(error, review)
    })
}

exports.getCollectionById = function(collectionid, callback) {

    db.get("SELECT * FROM collections WHERE collectionid = ?", [collectionid], function(error, collection) {
        callback(error, collection)
    })
}

exports.getReviewbyNameAndAuthor = function(name, author, callback) {

    db.get("SELECT * FROM reviews WHERE name = ? AND author = ?", [name, author], function(error, review) {
        callback(error, review)
    })
}

exports.deleteReview = function(id, callback) {
    db.get("DELETE FROM reviews WHERE reviewid = ?", [id], function(error) {
        callback(error)
    })
}

exports.editReview = function(name, author, rating, body, collectionid, id, callback) {
    db.get("UPDATE reviews SET name = ?, author = ?, rating = ?, body = ?, collectionid = ? WHERE reviewid = ?", [name, author, rating, body, collectionid, id], function(error) {
        callback(error)
    })
}

exports.editCollection = function(name, description, color, collectionid, callback) {
    db.get("UPDATE collections SET name = ?, description = ?, color = ? WHERE collectionid = ?", [name, description, color, collectionid], function(error) {
        callback(error)
    })
}

exports.increaseCollectionSize = function(collectionid, callback) {
    db.get("UPDATE collections SET noOfReviews = noOfReviews + 1 WHERE collectionid = ?", [collectionid], function(error) {
        callback(error)
    })
}

exports.deleteCollection = function(id, callback) {
    db.all("DELETE FROM collections WHERE collectionid = ?", [id], function(error) {
        callback(error)
    })
}

exports.resetCollectionPropertyInReview = function(id, callback) {
    db.all("UPDATE reviews SET collectionid = NULL WHERE collectionid = ?", [id], function(error) {
        callback(error)
    })
}

exports.deleteComments = function(id, callback) {
    db.all("DELETE FROM comments WHERE reviewid = ?", [id], function(error) {
        callback(error)
    })
}

exports.deleteComment = function(id, callback) {
    db.get("DELETE FROM comments WHERE commentid = ?", [id], function(error) {
        callback(error)
    })
}

exports.getNewestReview = function(callback) {
    db.get("SELECT * FROM reviews ORDER BY reviewid DESC LIMIT 1", function(error, review) {
        callback(error, review)
    })
}