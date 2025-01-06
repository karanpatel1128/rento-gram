const db = require('../config/db')

exports.fetchProductByProductId = async (id) => {
    const result = await db.query('SELECT * FROM tbl_products WHERE id  = ?', [id]);
    return result;
};

exports.fetchAllProducts = async (id) => {
    const result = await db.query('SELECT * FROM tbl_products WHERE userId  = ?', [id]);
    return result;
};

exports.addProduct = async (data) => {
    const result = await db.query(
        `INSERT INTO tbl_products (
            userId, 
            title, 
            descriptions, 
            keyNote, 
            location, 
            category, 
            subCategory,
            size,
            depositeAmount, 
            rentDayPrice, 
            ThreeDayDiscount, 
            sevenDayDiscount, 
            productsImages, 
            productStatus
        ) VALUES (?, ?,?,? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.userId,
            data.title,
            data.descriptions,
            data.keyNote,
            data.location,
            data.category,
            data.subCategory,
            data.size,
            data.depositeAmount,
            data.rentDayPrice,
            data.ThreeDayDiscount,
            data.sevenDayDiscount,
            data.productsImages,
            data.productStatus
        ]
    );
    return result;
};

exports.editProducts = async (obj, productId) => {
    let query = 'UPDATE tbl_products SET ';
    const fields = [];
    const values = [];
    Object.keys(obj).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(obj[key]);
    });
    query += fields.join(', ');
    query += ' WHERE id = ?';
    values.push(productId);
    const result = await db.query(query, values);
    return result;
};

exports.deleteProductById = async (id) => {
    const result = await db.query('DELETE FROM tbl_products WHERE id = ?', [id]);
    return result;
};
