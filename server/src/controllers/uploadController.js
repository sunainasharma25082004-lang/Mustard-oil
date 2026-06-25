const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FOLDERS = new Set(['products', 'site', 'certificates', 'recipes']);

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file',
      });
    }

    // Only upload to Cloudinary if keys are configured, else fail gracefully
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured. Please add API keys to environment variables.',
      });
    }

    const folder = ALLOWED_FOLDERS.has(req.query.folder) ? req.query.folder : 'products';

    const streamUpload = (reqObj) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `karyor/${folder}` },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(reqObj.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        folder,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };