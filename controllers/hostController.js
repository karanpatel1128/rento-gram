require('dotenv').config();
const model=require('../models/models')

exports.userRegister = async (req, res) => {
    try {
        let { mobileNumber } = req.body;
        const TO_NUMBER = mobileNumber;
        const verification = await client.verify.v2.services('VAa43dd6f54da927cdef56d08bf09dcb1c')
            .verifications
            .create({ to: TO_NUMBER, channel: 'sms' });
        res.status(200).json(
            {
                status: true,
                sid: verification.sid,
                message: 'Verification sent successfully'
            }
        );

    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to send verification', error: error.message });
    }
};
// Function to verify OTP for user registration
exports.otpVerifyFn = async (req, res) => {
    try {
        let { mobileNumber, otp } = req.body;
        let fcm_token = req.body.fcm_token;
        const verificationCheck = await client.verify.v2
            .services('VAa43dd6f54da927cdef56d08bf09dcb1c')
            .verificationChecks.create({
                code: otp,
                to: mobileNumber,
            });
        if (verificationCheck.valid == true) {
            let checkUser = await fetchUserByMobileNumber(mobileNumber);
            if (checkUser.length > 0) {
                await findExistsUserFcm_token(fcm_token, mobileNumber);
                let obj = {
                    gender: checkUser[0].gender ? checkUser[0].gender : null,
                    isOldUser: true,
                    userId: checkUser[0].id
                };
                return res.status(200).send({
                    status: true,
                    message: Msg.otpVerified,
                    data: obj
                });
            } else {
                let obj = {
                    fcm_token: fcm_token,
                    mobileNumber: mobileNumber,
                };
                let userCreated = await userRegister(obj);
                if (userCreated) {
                    let data = await fetchUserBy_Id(userCreated.insertId);
                    let obj = {
                        gender: data[0].gender ? data[0].gender : null,
                        isOldUser: false,
                        userId: data[0].id
                    };
                    return res.status(200).send({
                        status: true,
                        message: Msg.otpVerified,
                        data: obj
                    });
                }
            }
        } else {
            return res.status(400).send({
                status: false,
                message: Msg.wrongOtp
            });
        }
    } catch (error) {
        console.log('>>>>>>error', error);
        return res.status(500).send({
            status: false,
            message: Msg.err
        });
    }
};