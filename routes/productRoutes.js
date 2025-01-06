const express = require('express');
const { productController } = require('../controllers/index');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { userAuth } = require('../middleware/auth');
const { productValidation, handleValidationErrors } = require('../vallidations/productVallidations');




//----------------api start---------------------------------------//

/**
 * @Developer KARAN PATEL
 * @MODULE Products InterFace
 * @DATE 12-24-2024
 * 
 * */

router.post('/createProducts', userAuth, uploadMultiple, productValidation, handleValidationErrors, productController.createProducts);
router.get('/fetchAllProducts', userAuth, productController.fetchAllProductsByUsersId);
router.get('/fetchProductByProductId', userAuth, productController.fetchProductByProductId);
router.post('/editProduct/:productId', userAuth, uploadMultiple, productController.editProducts);
router.delete('/deleteUserProducts/:productId', userAuth, productController.deleteUserProducts);








module.exports = router;
