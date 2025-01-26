const db = require('../config/db')

exports.fetchProductByProductId = async (id) => {
    const result = await db.query(
        'SELECT *,tbl_category.categoryName FROM tbl_products LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id WHERE tbl_products.id = ?',
        [id]
    );
    return result;
};


exports.fetchAllProducts = async (id) => {
    const result = await db.query(`SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products
         LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
         LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
         WHERE userId  = ?`, [id]);
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
            isDepositeNegotiable, 
            isRentNegotiable,
            tags, 
            productsImages, 
            productStatus
        ) VALUES (?, ?,?,? ,?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?)`,
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
            data.isDepositeNegoitable,
            data.isRentNegoitable,
            data.tags,
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
