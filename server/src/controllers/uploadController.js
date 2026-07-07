const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FOLDERS = new Set(['products', 'site', 'certificates', 'recipes']);

const buildDataUrl = (file) => {
  if (!file?.buffer?.length) return '';
  const mime = file.mimetype || 'image/png';
  return `data:${mime};base64,${file.buffer.toString('base64')}`;
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file',
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

    let result = null;
    const hasCloudinaryConfig = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinaryConfig) {
      try {
        result = await streamUpload(req);
      } catch {
        result = null;
      }
    }

    if (result?.secure_url) {
      return res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          folder,
        },
      });
    }

    const fallbackUrl = buildDataUrl(req.file);
    if (!fallbackUrl) {
      return res.status(500).json({
        success: false,
        message: 'Image upload failed. Please try again with a smaller image.',
      });
    }

    return res.json({
      success: true,
      message: 'Image uploaded successfully using local fallback.',
      data: {
        url: fallbackUrl,
        publicId: null,
        folder,
        fallback: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };