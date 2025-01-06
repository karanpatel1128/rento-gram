const { body, validationResult } = require('express-validator');

const userValidation = [
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 3 })
        .withMessage('Full name must be at least 3 characters long'),

    body('location')
        .notEmpty()
        .withMessage('Location is required'),

    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('dob')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isDate()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
            const currentDate = new Date();
            const dob = new Date(value);
            if (dob >= currentDate) {
                throw new Error('Date of birth must be in the past');
            }
            return true;
        })
];

// Middleware function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: false,
            message: errors.errors[0].msg
        });
    }
    next();
};

// Exporting validation rules and error handling middleware
module.exports = {
    userValidation,
    handleValidationErrors
}
