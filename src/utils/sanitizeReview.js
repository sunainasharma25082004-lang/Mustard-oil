const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-z0-9-]+\.)+(?:com|in|org|net|io|co)\/[^\s]*/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const HTML_ENTITY_PATTERN = /&(?:#x?[0-9a-f]+|[a-z]+);/gi;
const PROMO_PATTERN = /\b(buy now|click here|visit us|visit our|discount code|promo code|coupon code|offer link|limited time|check out|order now)\b/gi;
const SCRIPT_PATTERN = /javascript:|data:text\/html/i;

const containsBlockedContent = (text) => {
  const urlCheck = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  const promoCheck = new RegExp(PROMO_PATTERN.source, PROMO_PATTERN.flags);
  const scriptCheck = new RegExp(SCRIPT_PATTERN.source, SCRIPT_PATTERN.flags);

  if (urlCheck.test(text)) return 'URLs and links are not allowed in reviews';
  if (scriptCheck.test(text)) return 'Invalid content is not allowed in reviews';
  if (promoCheck.test(text)) return 'Promotional content is not allowed in reviews';
  return null;
};

export const sanitizeReviewInput = (text, maxLength = 2000) => {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Review text is required' };
  }

  let sanitized = text.trim();

  if (!sanitized) {
    return { valid: false, message: 'Review text cannot be empty' };
  }

  const blocked = containsBlockedContent(sanitized);
  if (blocked) {
    return { valid: false, message: blocked };
  }

  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');
  sanitized = sanitized.replace(HTML_ENTITY_PATTERN, '');
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  sanitized = sanitized.replace(PROMO_PATTERN, '');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  if (!sanitized) {
    return { valid: false, message: 'Review contains only disallowed content' };
  }

  return { valid: true, value: sanitized.slice(0, maxLength) };
};

export const sanitizeReviewField = (value, maxLength = 100, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback;
  let sanitized = value.replace(HTML_TAG_PATTERN, '').replace(HTML_ENTITY_PATTERN, '').trim();
  const urlCheck = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  if (urlCheck.test(sanitized)) {
    return { valid: false, message: 'URLs and links are not allowed' };
  }
  sanitized = sanitized.replace(urlCheck, '').trim();
  if (!sanitized) return { valid: true, value: fallback };
  return { valid: true, value: sanitized.slice(0, maxLength) };
};