const multer = require('multer');
const path = require('path');

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Specify the folder to store the images/videos
    },
    filename: function (req, file, cb) {
        // Generate a unique name for the file using its original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
function fileFilter(req, file, cb) {
    // Allowed file types for images and videos
    const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed'));
    }
}

// Initialize the upload middleware with file size limit and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
    fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Middleware for multiple file uploads (up to 5 files)
const uploadMultiple = upload.array('media', 5);

module.exports = {
    uploadSingle,
    uploadMultiple
};
