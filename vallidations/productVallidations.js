const { body, validationResult } = require('express-validator');

const productValidation = [
    // Title
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters long'),

    // Descriptions
    body('descriptions')
        .notEmpty()
        .withMessage('Descriptions are required')
        .isLength({ min: 10 })
        .withMessage('Descriptions must be at least 10 characters long'),

    // Key Note
    body('keyNote')
        .optional() // This field is optional
        .isLength({ max: 255 })
        .withMessage('Key note must not exceed 255 characters'),

    // Location
    body('location')
        .notEmpty()
        .withMessage('Location is required'),

    // Category
    body('category')
        .notEmpty()
        .withMessage('Category is required'),

    // Subcategory
    body('subCategory')
        .notEmpty()
        .withMessage('Subcategory is required'),

    // Size
    body('size')
        .optional()
        .custom((value) => {
            // Allow predefined sizes
            const allowedSizes = ['small', 'medium', 'large', 'extra-large'];
            if (allowedSizes.includes(value)) {
                return true;
            }

            // Allow numeric values between 1 and 1000
            const sizeAsNumber = Number(value);
            if (!isNaN(sizeAsNumber) && sizeAsNumber >= 1 && sizeAsNumber <= 1000) {
                return true;
            }

            // If neither condition is satisfied, throw an error
            throw new Error('Size must be one of the following: small, medium, large, extra-large, or a number between 1 and 1000');
        })
        .withMessage('Size must be one of the following: small, medium, large, extra-large'),

    // Deposite Amount
    body('depositeAmount')
        .notEmpty()
        .withMessage('Deposite amount is required')
        .isNumeric()
        .withMessage('Deposite amount must be a numeric value'),

    // Rent Day Price
    body('rentDayPrice')
        .notEmpty()
        .withMessage('Rent day price is required')
        .isNumeric()
        .withMessage('Rent day price must be a numeric value'),

    // 3-Day Discount
    body('3DayDiscount')
        .optional()
        .isNumeric()
        .withMessage('3-day discount must be a numeric value'),

    // 7-Day Discount
    body('7DayDiscount')
        .optional()
        .isNumeric()
        .withMessage('7-day discount must be a numeric value'),

];

// Middleware function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: false,
            message: errors.errors[0].msg // Return the first validation error
        });
    }
    next();
};

// Exporting validation rules and error handling middleware
module.exports = {
    productValidation,
    handleValidationErrors
};
