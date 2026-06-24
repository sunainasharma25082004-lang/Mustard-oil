const MAX_PRODUCT_IMAGES = 10;

function normalizeImagesInput(body = {}) {
  let images = [];

  if (Array.isArray(body.images)) {
    images = body.images.map((item) => String(item).trim()).filter(Boolean);
  } else if (body.image) {
    images = [String(body.image).trim()];
  }

  images = images.slice(0, MAX_PRODUCT_IMAGES);

  return {
    images,
    image: images[0] || String(body.image || '').trim() || '/bottle.png',
  };
}

function collectProductImagePaths(product) {
  const paths = new Set();

  if (product?.image) {
    paths.add(product.image);
  }

  if (Array.isArray(product?.images)) {
    product.images.forEach((item) => {
      if (item) paths.add(item);
    });
  }

  return [...paths];
}

module.exports = {
  MAX_PRODUCT_IMAGES,
  normalizeImagesInput,
  collectProductImagePaths,
};