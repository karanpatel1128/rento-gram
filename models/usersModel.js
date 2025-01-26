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

exports.fetchAllSubCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_subcategory');
    return result;
};

exports.fetchOnlyOtherUsersProducts = async (userId, search) => {
    const result = await db.query(
        `SELECT 
            tbl_products.id,
            title,
            descriptions,
            keyNote,
            location,
            productsImages,
            categoryName,
            subcategoryName,
            tbl_products.depositeAmount,
            tbl_products.rentDayPrice,
            tbl_category.id as category,
            tbl_subcategory.id as subCategory
        FROM 
            tbl_products
        LEFT JOIN 
            tbl_category 
        ON 
            tbl_category.id = tbl_products.category
        LEFT JOIN 
            tbl_subcategory 
        ON 
            tbl_subcategory.id = tbl_products.subCategory
        WHERE 
            isRent = 0 
            AND productStatus = 1 
            AND userId != ? 
            ${search ? `AND (
                title LIKE ? OR 
                descriptions LIKE ? OR 
                keyNote LIKE ? OR 
                categoryName LIKE ? OR 
                subcategoryName LIKE ?
            )` : ''}`,
        search ? [userId, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [userId]
    );
    return result;
};

