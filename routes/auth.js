const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin, validateProfileUpdate, handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Registrace uživatele
router.post('/register', validateRegistration, handleValidationErrors, (req, res) => {
    const { username, name, email, password } = req.body;

    // Kontrola, zda už uživatel s tímto jménem nebo emailem neexistuje
    userModel.findUserByUsername(username, (err, user) => {
        if (user) return res.status(400).send('Toto uživatelské jméno již existuje.');
        userModel.findUserByEmail(email, (err, user) => {
            if (user) return res.status(400).send('Tento email již je registrován.');

            // Hašování hesla před uložením
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return res.status(500).send('Server error');
                userModel.createUser(username, name, email, hashedPassword, (err, userId) => {
                    if (err) return res.status(500).send('Chyba při registraci uživatele');
                    res.status(201).send({ message: 'Uživatel byl úspěšně zaregistrován', userId });
                });
            });
        });
    });
});

// Přihlášení uživatele
router.post('/login', validateLogin, handleValidationErrors, (req, res) => {
    const { username, password } = req.body;

    userModel.findUserByUsername(username, (err, user) => {
        if (err || !user) return res.status(400).send('Neplatné uživatelské jméno nebo heslo');
        
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(400).send('Neplatné uživatelské jméno nebo heslo');

            const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
            res.status(200).json({ message: 'Přihlášení úspěšné', token });
        });
    });
});

// Úprava profilu uživatele
router.put('/profile', validateProfileUpdate, handleValidationErrors, (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.userId; // Získání ID uživatele z tokenu (middleware pro ověření tokenu)

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Chyba při aktualizaci hesla');
        userModel.updateUser(userId, name, email, hashedPassword, (err) => {
            if (err) return res.status(500).send('Chyba při aktualizaci uživatele');
            res.status(200).send({ message: 'Profil byl úspěšně aktualizován' });
        });
    });
});

module.exports = router;

const { authenticateToken } = require('../middleware/auth');

router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, (req, res) => {
    // Zbytek kódu pro úpravu profilu
});
