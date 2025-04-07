const db = require('../db');

module.exports = {
    // Registrace uživatele
    createUser: (username, name, email, password, callback) => {
        const stmt = db.prepare("INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)");
        stmt.run(username, name, email, password, function(err) {
            callback(err, this.lastID); // Vrátí ID nově vytvořeného uživatele
        });
    },

    // Vyhledání uživatele podle uživatelského jména
    findUserByUsername: (username, callback) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            callback(err, row);
        });
    },

    // Vyhledání uživatele podle emailu
    findUserByEmail: (email, callback) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            callback(err, row);
        });
    },

    // Aktualizace údajů uživatele
    updateUser: (id, name, email, password, callback) => {
        const stmt = db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?");
        stmt.run(name, email, password, id, function(err) {
            callback(err);
        });
    }
};
