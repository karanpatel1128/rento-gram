const express = require('express');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Use the userRoutes with '/userRoutes' prefix
router.use('/userRoutes', userRoutes);

module.exports = router;
