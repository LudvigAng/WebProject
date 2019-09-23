const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("database.db")


db.run(` 
    CREATE TABLE IF NOT EXISTS reviews (
                reviewid INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                rating INTEGER,
                body TEXT
    )
`)


exports.writeReview = function(name, rating, body, callback) {

    db.run("INSERT INTO reviews (name, rating, body) VALUES (?, ?, ?)", [name, rating, body], function(error) {
        callback(error, this.lastID)
    })
}


exports.getReviews = function(callback) {

    db.all("SELECT * FROM reviews", function(error, reviews) {
        callback(error, reviews)
    })
}

exports.getReviewById = function(id, callback) {

    db.get("SELECT * FROM reviews WHERE id = ?", [id], function(error, review) {
        callback(error, review)
    })
}