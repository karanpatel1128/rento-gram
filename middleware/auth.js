require('dotenv').config();
const jwt = require('jsonwebtoken');
const { fetchUserByIds } = require('../models/usersModel');
const SECRET_KEY = process.env.SECRET_KEY ;
const { msg } = require('../utils/commonMessage');

const userAuth = async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            req.token = bearer[1];
            const verifyUser = jwt.verify(req.token, SECRET_KEY);
            const user = await fetchUserByIds(verifyUser.userId);
            if (user && user.length > 0) {
                req.user = user[0];
                next(); 
            } else {
                return res.status(403).json({
                    message: msg.unauthorizedAccess,
                    success: false,
                    status: 403,
                });
            }
        } else {
            return res.status(401).json({
                message: msg.tokenRequired,
                success: false,
                status: 401,
            });
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // Handle token expired error
            return res.status(401).json({
                message: msg.tokenExpired,
                success: false,
                status: 401,
            });
        } else if (err.name === 'JsonWebTokenError') {
            // Handle other JWT errors (e.g., invalid signature)
            return res.status(403).json({
                message: msg.invalidToken,
                success: false,
                status: 403,
            });
        } else {
            // Handle other errors
            return res.status(500).json({
                message: msg.serverError,
                success: false,
                status: 500,
            });
        }
    }
};

module.exports = { userAuth };