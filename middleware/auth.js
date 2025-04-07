const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin, validateProfileUpdate, handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Registrace uživatele
router.post('/register', validateRegistration, handleValidationErrors, (req, res) => {
    const { username, name, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Server error');
        userModel.createUser(username, name, email, hashedPassword, (err, userId) => {
            if (err) return res.status(500).send('Error creating user');
            res.status(201).send({ message: 'User created successfully', userId });
        });
    });
});

// Přihlášení uživatele
router.post('/login', validateLogin, handleValidationErrors, (req, res) => {
    const { username, password } = req.body;

    userModel.findUserByUsername(username, (err, user) => {
        if (err || !user) return res.status(400).send('Invalid username or password');
        
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(400).send('Invalid username or password');

            const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        });
    });
});

// Úprava profilu uživatele
router.put('/profile', validateProfileUpdate, handleValidationErrors, (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.userId; // Získání ID uživatele z tokenu (middleware pro ověření tokenu)

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Server error');
        userModel.updateUser(userId, name, email, hashedPassword, (err) => {
            if (err) return res.status(500).send('Error updating user');
            res.status(200).send({ message: 'Profile updated successfully' });
        });
    });
});

module.exports = router;

const jwt = require('jsonwebtoken');

module.exports = {
    authenticateToken: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).send('Access denied.');

        jwt.verify(token, 'secret', (err, user) => {
            if (err) return res.status(403).send('Invalid token');
            req.userId = user.userId;
            next();
        });
    }
};

