require('dotenv').config();
const {
    fetchUserByMobileNumber,
    findExistsUserFcmToken,
    addUsersByMobileNumber,
    fetchUserByIds,
    editUsersProfile,
    fetchAllCategoryList,
    fetchAllSubCategoryList,
    listOfSubCategoryByCategoryId,
    fetchOnlyOtherUsersProducts,

} = require('../models/usersModel')
const { msg } = require('../utils/commonMessage')
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { baseUrl } = require('../config/path');
const { log } = require('util');
const { haversineDistance } = require('../utils/helper')



// --------------user register with there mobile number-------------------------
exports.userRegister = async (req, res) => {
    try {
        let { mobileNumber } = req.body;
        // const TO_NUMBER = mobileNumber;
        // const verification = await client.verify.v2.services('VAa43dd6f54da927cdef56d08bf09dcb1c')
        //     .verifications
        //     .create({ to: TO_NUMBER, channel: 'sms' });
        res.status(200).json(
            {
                success: true,
                status: 200,
                // sid: verification.sid,
                sid: msg.otpMessage,
                message: msg.verificationSuccess
            }
        );

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to send verification',
            error: error.message
        });
    }
};

//--------------- Function to verify OTP for user registration------------------
exports.otpVerifyFn = async (req, res) => {
    try {
        let { mobileNumber, otp } = req.body;
        // let fcm_token = req.body.fcm_token;
        let fcmToken = 'abcdefgh';

        // const verificationCheck = await client.verify.v2
        //     .services('VAa43dd6f54da927cdef56d08bf09dcb1c')
        //     .verificationChecks.create({
        //         code: otp,
        //         to: mobileNumber,
        //     });
        // if (verificationCheck.valid == true) {
        let checkUser = await fetchUserByMobileNumber(mobileNumber);
        if (checkUser.length > 0) {
            await findExistsUserFcmToken(fcmToken, mobileNumber);
            const token = jwt.sign(
                { userId: checkUser[0].id, mobileNumber },
                secretKey,
                { expiresIn: '24h' }
            );
            let obj = {
                gender: checkUser[0].gender || null,
                isOldUser: true,
                userId: checkUser[0].id,
                token: token
            };
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.otpVerified,
                data: obj
            });
        } else {
            let obj = {
                mobileNumber: mobileNumber,
                fcmToken: fcmToken,
            };
            let userCreated = await addUsersByMobileNumber(obj);
            if (userCreated) {
                let data = await fetchUserByIds(userCreated.insertId);
                const token = jwt.sign(
                    { userId: data[0].id, mobileNumber },
                    secretKey,
                    { expiresIn: '1h' }
                );

                let obj = {
                    gender: data[0].gender || null,
                    isOldUser: false,
                    userId: data[0].id,
                    token: token
                };
                return res.status(200).send({
                    success: true,
                    status: 200,
                    message: msg.otpVerified,
                    data: obj
                });
            }
        }
        // } else {
        //     return res.status(400).send({
        //         status: false,
        //         message: Msg.wrongOtp
        //     });
        // }
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            success: false,
            status: 500,
            message: msg.serverError
        });
    }
};

//--------------- Function to update users profile------------------
exports.updateUsersProfile = async (req, res) => {
    try {
        let userId = req.user.id
        let { fullName, location, gender, email, dob } = req.body;
        let fileName;
        if (req.file) {
            fileName = req.file.filename
        }
        let obj = {
            fullName,
            profileImages: fileName,
            location: JSON.stringify(location),
            email,
            dob,
            gender,
            pageCompleted: 1
        }
        let result = await editUsersProfile(obj, userId);
        if (result.affectedRows === 1) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.profileUpdatedSuccessfully,
            });
        } else {
            return res.status(200).send({
                success: true,
                status: 200,
                message: msg.profileUpdatedFailed,
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

// --------------Function fetch users profiles------------------------------
exports.fetchProfileById = async (req, res) => {
    try {
        let userId = req.user.id
        console.log('userId', userId);

        let result = await fetchUserByIds(userId);
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: msg.dataFoundFailed,
                data: []
            });
        }
        console.log('result.location>>>>>>.', result[0].location);

        result.map((item) => {
            // item.location = JSON.parse(item.location.replace(/\\|"/g, ''))
            item.profileImages = item.profileImages ? `${baseUrl}/uploads/${item.profileImages}` : null
            return item
        })
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

exports.fetchAllCategory = async (req, res) => {
    try {
        let userId = req.user.id

        let result = await fetchAllCategoryList();
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 200,
                message: msg.dataFoundFailed,
                data: []
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: msg.dataFoundSuccess,
            data: result
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

exports.fetchSubCategoryByCategoryId = async (req, res) => {
    try {
        let { id } = req.query
        let result = id ? await listOfSubCategoryByCategoryId(id) : await fetchAllSubCategoryList();
        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                status: 200,
                message: msg.noSubcategoryFound,
                data: []
            });
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: msg.subCategoryFoundSuccess,
            data: result
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

exports.searchProductsList = async (req, res) => {
    try {
        let { search } = req.query
        let userId = req.user.id
        let result = await fetchUserByIds(userId);
        let fetchUserlatLong = [];
        let loc = result[0].location
        fetchUserlatLong = JSON.parse(loc.replace(/"/g, ''));
        let data = await fetchOnlyOtherUsersProducts(userId, search)
        let filteredData = [];
        if (data.length > 0) {
            filteredData = await Promise.all(data.filter(async (item) => {
                let img = item.productsImages ? JSON.parse(item.productsImages) : []
                item.productsImages = img.length > 0 ? img.map((i) => {
                    return i = `${baseUrl}/upload/${i}`
                }) : []
                if (item.location) {
                    let productLocation = JSON.parse(item.location.replace(/"/g, ''));
                    let distance = await haversineDistance(fetchUserlatLong, productLocation);
                    return distance <= 10;
                }
                return item;
            })
            );
        }
        return res.status(200).send({
            success: true,
            status: 200,
            message: msg.dataFoundSuccess,
            data: filteredData
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
