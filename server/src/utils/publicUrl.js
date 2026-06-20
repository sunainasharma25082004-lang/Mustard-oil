const LOCAL_API_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const normalizeBaseUrl = (url) => String(url || '').trim().replace(/\/$/, '');

const isLocalApiUrl = (url) => LOCAL_API_PATTERN.test(normalizeBaseUrl(url));

const getPublicApiBaseUrl = (options = {}) => {
  const preferPublic = options.preferPublic || process.env.NODE_ENV === 'production';
  const apiPublic = normalizeBaseUrl(process.env.API_PUBLIC_URL);
  const renderExternal = normalizeBaseUrl(process.env.RENDER_EXTERNAL_URL);

  if (preferPublic) {
    if (apiPublic && !isLocalApiUrl(apiPublic)) return apiPublic;
    if (renderExternal && !isLocalApiUrl(renderExternal)) return renderExternal;
  }

  return apiPublic || renderExternal || '';
};

const getShiprocketWebhookUrl = () => {
  const base = getPublicApiBaseUrl({ preferPublic: true });
  return base ? `${base}/api/webhooks/shiprocket` : null;
};

module.exports = {
  getPublicApiBaseUrl,
  getShiprocketWebhookUrl,
  isLocalApiUrl,
};