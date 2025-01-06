const userController = require('./userController');
const productController = require('./productController');



const controller = {
    userController: userController,
    productController: productController
};

module.exports = controller;