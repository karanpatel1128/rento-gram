const db = require('../config/db')

exports.fetchUserByMobileNumber = async (mobileNumber) => {
    const result = await db.query('SELECT * FROM tbl_users WHERE mobileNumber = ?', [mobileNumber]);
    return result;
};

exports.fetchUserByIds = async (id) => {
    const result = await db.query('SELECT * FROM tbl_users WHERE id = ?', [id]);
    return result;
};

exports.findExistsUserFcmToken = async (fcmToken, mobileNumber) => {
    const result = await db.query(
        'UPDATE tbl_users SET fcmToken = ? WHERE mobileNumber = ?',
        [fcmToken, mobileNumber]
    );
    return result;
};

exports.addUsersByMobileNumber = async (data) => {
    const result = await db.query(
        'INSERT INTO tbl_users (mobileNumber, fcmToken) VALUES (?, ?)',
        [data.mobileNumber, data.fcmToken]
    );
    return result;
};

exports.editUsersProfile = async (obj, userId) => {
    const result = await db.query(
        'UPDATE tbl_users SET fullName = ?,profileImages=?,location=?,email=?,dob=?,gender=?,pageCompleted=? WHERE id = ?',
        [obj.fullName, obj.profileImages, obj.location, obj.email, obj.dob, obj.gender, obj.pageCompleted, userId]
    );
    return result;
};

exports.fetchAllCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_category ORDER BY createdAt DESC');
    return result;
};

exports.listOfSubCategoryByCategoryId = async (id) => {
    const result = await db.query('SELECT * FROM tbl_subcategory WHERE categoryId = ?', [id]);
    return result;
};