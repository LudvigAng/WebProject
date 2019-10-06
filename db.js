const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")


db.run(` 
    CREATE TABLE IF NOT EXISTS reviews (
                reviewid INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                author TEXT,
                rating INTEGER,
                publishtime TEXT,
                body TEXT
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

exports.writeReview = function(name, author, rating, publishtime, body, callback) {

    db.run("INSERT INTO reviews (name, author, rating, publishtime, body) VALUES (?, ?, ?, ?, ?)", [name, author, rating, publishtime, body], function(error) {
        callback(error, this.lastID)
    })
}

exports.writeComment = function(name, body, publishtime, reviewid, callback) {

    db.run("INSERT INTO comments (name, body, publishtime, reviewid) VALUES (?, ?, ?, ?)", [name, body, publishtime, reviewid], function(error) {
        callback(error, this.lastID)
    })
}

exports.getComments = function(reviewid, callback) {

    db.all("SELECT * FROM comments WHERE reviewid = ?", [reviewid], function(error, comments) {
        callback(error, comments)
    })
}

exports.getReviews = function(callback) {

    db.all("SELECT * FROM reviews", function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getReviewById = function(id, callback) {

    db.get("SELECT * FROM reviews WHERE reviewid = ?", [id], function(error, review) {
        callback(error, review)
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

exports.editReview = function(name, author, rating, body, id, callback) {
    db.get("UPDATE reviews SET name = ?, author = ?, rating = ?, body = ? WHERE reviewid = ?", [name, author, rating, body, id], function(error) {
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
        callback(id, error)
    })
}