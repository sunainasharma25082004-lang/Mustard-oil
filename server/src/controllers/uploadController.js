const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file',
      });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: `/uploads/products/${filename}`,
        publicId: filename,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };