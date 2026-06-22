const fs = require('fs');
const path = require('path');

const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const ALLOWED_FOLDERS = new Set(['products', 'site', 'certificates', 'recipes']);

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file',
      });
    }

    const folder = ALLOWED_FOLDERS.has(req.query.folder) ? req.query.folder : 'products';
    const uploadDir = path.join(UPLOAD_BASE, folder);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: `/uploads/${folder}/${filename}`,
        publicId: filename,
        folder,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };