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

const sanitizeReviewText = (text, { maxLength = 2000 } = {}) => {
  if (!text || typeof text !== 'string') {
    return { sanitized: '', rejected: true, reason: 'Review text is required' };
  }

  let sanitized = text.trim();

  if (sanitized.length === 0) {
    return { sanitized: '', rejected: true, reason: 'Review text cannot be empty' };
  }

  const blocked = containsBlockedContent(sanitized);
  if (blocked) {
    return { sanitized: '', rejected: true, reason: blocked };
  }

  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');
  sanitized = sanitized.replace(HTML_ENTITY_PATTERN, '');
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  sanitized = sanitized.replace(PROMO_PATTERN, '');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  if (sanitized.length === 0) {
    return { sanitized: '', rejected: true, reason: 'Review contains only disallowed content' };
  }

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return { sanitized, rejected: false };
};

const sanitizeReviewName = (name, { maxLength = 100 } = {}) => {
  if (!name || typeof name !== 'string') return 'Anonymous Customer';
  let sanitized = name.replace(HTML_TAG_PATTERN, '').replace(HTML_ENTITY_PATTERN, '').trim();
  const urlCheck = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  if (urlCheck.test(sanitized)) return 'Anonymous Customer';
  sanitized = sanitized.replace(urlCheck, '').trim();
  if (!sanitized) return 'Anonymous Customer';
  return sanitized.slice(0, maxLength);
};

const sanitizeReviewLocation = (location, { maxLength = 80 } = {}) => {
  if (!location || typeof location !== 'string') return 'India';
  let sanitized = location.replace(HTML_TAG_PATTERN, '').replace(HTML_ENTITY_PATTERN, '').trim();
  const urlCheck = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  if (urlCheck.test(sanitized)) return 'India';
  sanitized = sanitized.replace(urlCheck, '').trim();
  if (!sanitized) return 'India';
  return sanitized.slice(0, maxLength);
};

module.exports = {
  sanitizeReviewText,
  sanitizeReviewName,
  sanitizeReviewLocation,
  containsBlockedContent,
};