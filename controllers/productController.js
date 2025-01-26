require('dotenv').config();
const { json } = require('body-parser');
const {
    addProduct,
    fetchAllProducts,
    fetchProductByProductId,
    editProducts,
    deleteProductById,

} = require('../models/productsModel')
const { msg } = require('../utils/commonMessage')
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { baseUrl } = require('../config/path');
const { log } = require('util');
const { fetchAllCategory } = require('./userController');


// --------------users can host there products-------------------------
exports.createProducts = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            title,
            descriptions,
            keyNote,
            location,
            category,
            subCategory,
            size,
            depositeAmount,
            rentDayPrice,
            isDepositeNegoitable,
            isRentNegoitable,
            tags
        } = req.body;
        let files = req.files;
        let productsImages = [];
        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        let obj = {
            userId,
            title,
            descriptions,
            keyNote,
            location: JSON.stringify(location),
            category,
            subCategory,
            size,
            depositeAmount,
            rentDayPrice,
            isDepositeNegoitable,
            isRentNegoitable,
            tags: JSON.stringify(tags),
            productsImages: JSON.stringify(productsImages),
            productStatus: 0
        }

        let result = await addProduct(obj)
        if (result.insertId) {
            return res.status(200).send({
                status: 200,
                success: true,
                productId: result.insertedId,
                message: msg.productAddSuccess
            });
        } else {
            return res.status(400).send({
                status: 400,
                success: false,
                productId: null,
                message: msg.productAddFailed
            });
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

//--------------- Function to fetch all products by users id ------------------
exports.fetchAllProductsByUsersId = async (req, res) => {
    try {
        let userId = req.user.id
        let result = await fetchAllProducts(userId)
        if (result.length === 0) {
            return res.status(400).send({
                status: 400,
                success: false,
                message: msg.productNotFound,
                data: []
            })
        }
        result.map(async (item) => {
            let formattedTags = item.tags.replace(/[\[\]]/g, '').split(',').map(tag => tag.trim().replace(/^["']|["']$/g, ''));
            item.tags = formattedTags;
            if (item.productsImages) {
                let images = JSON.parse(item.productsImages);
                item.productsImages = images.map(image => `${baseUrl}/uploads/${image}`);
            } else {
                item.productsImages = [];
            }
            return item;
        })
        return res.status(200).send({
            status: 200,
            success: true,
            message: msg.productFoundSuccess,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

// --------------Function fetch products by there ids------------------------------
exports.fetchProductByProductId = async (req, res) => {
    try {
        let userId = req.user.id
        let { productId } = req.query
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.dataFoundFailed,
                data: []
            });
        }
        let productsImg = result[0].productsImages == null ? null : JSON.parse(result[0].productsImages)
        result[0].productsImages = productsImg.map(image => `${baseUrl}/uploads/${image}`);
        return res.status(200).send({
            success: true,
            status: 200,
            message: msg.dataFoundSuccess,
            data: result[0]
        });

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: msg.serverError
        });
    }
};

exports.editProducts = async (req, res) => {
    try {
        const productId = req.params.productId;
        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.dataFoundFailed,
                data: []
            });
        }
        if (result[0].isRent == 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.productAlreadyRent,
                data: []
            });
        }
        let files = req.files;
        let productsImages = result[0].productsImages.length == null ? [] : result[0].productsImages;
        if (files && files.length > 0) {
            productsImages = files.map((file) => file.filename);
        }
        req.body.productsImages = productsImages
        req.body.productStatus = 0
        let editProductById = await editProducts(req.body, productId);
        if (editProductById.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.productUpdateSuccess
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.productUpdateFailed
            });
        }

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: msg.serverError
        });
    }
};

exports.deleteUserProducts = async (req, res) => {
    try {
        let userId = req.user.id
        const productId = req.params.productId;

        let result = await fetchProductByProductId(productId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.dataFoundFailed,
                data: []
            });
        }
        if (result[0].isRent == 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.productAlreadyRent,
                data: []
            });
        }
        let deleteProducts = await deleteProductById(productId);

        if (deleteProducts.affectedRows > 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.productDeleteSuccess
            });
        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.productNotFound
            });
        }

    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: msg.serverError
        });
    }
};
