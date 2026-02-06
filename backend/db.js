const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite Database (File-based)
const dbPath = path.resolve(__dirname, 'quietmap.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize Tables
db.serialize(() => {
    // 1. Markers Table (Noise Reports)
    db.run(`CREATE TABLE IF NOT EXISTS markers (
        id TEXT PRIMARY KEY,
        lat REAL,
        lng REAL,
        db INTEGER,
        locationName TEXT, 
        timestamp INTEGER
    )`);

    // 2. Reviews Table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        markerId TEXT,
        text TEXT,
        tags TEXT, 
        timestamp INTEGER,
        FOREIGN KEY(markerId) REFERENCES markers(id) ON DELETE CASCADE
    )`);
});

// Helper Functions (Promisified for async/await)
const dbAsync = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    },
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

module.exports = { db, dbAsync };
