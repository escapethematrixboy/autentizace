const { body, validationResult } = require('express-validator');

module.exports = {
    validateRegistration: [
        body('username').not().isEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validateLogin: [
        body('username').not().isEmpty().withMessage('Username is required'),
        body('password').not().isEmpty().withMessage('Password is required'),
    ],
    validateProfileUpdate: [
        body('name').not().isEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    handleValidationErrors: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
};
