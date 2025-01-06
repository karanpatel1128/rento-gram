const express = require('express');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');


const router = express.Router();

// Use the userRoutes with '/userRoutes' prefix
router.use('/userRoutes', userRoutes);
router.use('/productRoutes', productRoutes);


module.exports = router;
