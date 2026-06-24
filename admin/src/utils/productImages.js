export const MAX_PRODUCT_IMAGES = 10;

export function getProductImages(product) {
  if (!product) return [];

  const fromArray = Array.isArray(product.images)
    ? product.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (fromArray.length > 0) {
    return fromArray.slice(0, MAX_PRODUCT_IMAGES);
  }

  if (product.image) {
    return [product.image];
  }

  return [];
}

export function getProductPrimaryImage(product) {
  return getProductImages(product)[0] || '';
}