const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Chyba při připojení k databázi:', err.message);
    } else {
        console.log('Úspěšně připojeno k databázi.');
    }
});

// Vytvoření tabulky uživatelů, pokud ještě neexistuje
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);
});

module.exports = db;
