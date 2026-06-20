/** Short CDN/browser cache for semi-static assets */
const cachePublic = (maxAgeSeconds = 300) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`);
  }
  next();
};

/** Admin-managed content must always be fresh on the store */
const noCache = (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
};

module.exports = cachePublic;
module.exports.noCache = noCache;