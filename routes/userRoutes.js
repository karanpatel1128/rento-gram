const express = require('express');
const { userController } = require('../controllers/index');
const router = express.Router();
const { uploadSingle } = require('../middleware/upload');
const { userAuth } = require('../middleware/auth');
const { userValidation, handleValidationErrors } = require('../vallidations/userVallidations');




//----------------api start---------------------------------------//

/**
 * @Developer KARAN PATEL
 * @MODULE Users InterFace
 * @DATE 12-24-2024
 * 
 * */

router.post('/signup', userController.userRegister);
router.post('/otpVerify', userController.otpVerifyFn);
router.post('/updateProfile', userAuth, uploadSingle, userValidation, handleValidationErrors, userController.updateUsersProfile);
router.get('/fetchProfileById', userAuth, userController.fetchProfileById);

// ------------------category----------------------------------------//

router.get('/fetchAllCategory', userAuth, userController.fetchAllCategory);
router.get('/fetchSubCategoryByCategoryId', userAuth, userController.fetchSubCategoryByCategoryId);

// --------------------search products----------------------------------------//

router.get('/searchProductsList', userAuth, userController.searchProductsList);








module.exports = router;
