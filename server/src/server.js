const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.local'), override: true });

const connectDB = require('./config/database');
const seedProducts = require('./utils/seedProducts');
const seedAdmin = require('./utils/seedAdmin');
const { seedSettings } = require('./utils/deliveryHelpers');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contentRoutes = require('./routes/contentRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const seedContent = require('./utils/seedContent');
const seedReviews = require('./utils/seedReviews');
const seedShiprocket = require('./utils/seedShiprocket');
const seedPaymentGateways = require('./utils/seedPaymentGateways');
const seedSiteImages = require('./utils/seedSiteImages');
const { getIntegrationStatus } = require('./utils/integrationStatus');
const { getPublicApiBaseUrl } = require('./utils/publicUrl');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Render / nginx send X-Forwarded-For — required for express-rate-limit on hosted deploys
const isRenderHost = process.env.RENDER === 'true' || Boolean(process.env.RENDER_EXTERNAL_URL?.trim());
const shouldTrustProxy =
  process.env.TRUST_PROXY !== 'false' &&
  (process.env.TRUST_PROXY === 'true' ||
    process.env.NODE_ENV === 'production' ||
    isRenderHost);

if (shouldTrustProxy) {
  app.set('trust proxy', 1);
}

// CORS allowed origins - supports CLIENT_URL env (comma separated) + sensible defaults
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'https://mustard-oil-frontend.onrender.com',
  'https://mustard-oil-admin-9itt.onrender.com',
  'https://karyor.com',
  'https://www.karyor.com',
  'https://karyor-store.onrender.com',
  'https://karyor-admin.onrender.com',
  'https://admin.karyor.com',
  // Dev / local
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(compression());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 for local development (any port)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      console.log("[CORS BLOCKED]", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.options(/.*/
  , cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  skip: (req) => req.path.startsWith('/api/webhooks') || req.originalUrl.includes('/webhooks'),
  validate: {
    xForwardedForHeader: false,
  },
});

app.use(express.json({ limit: '1mb' }));
app.use('/api/webhooks', webhookRoutes);
app.use('/api', limiter);
// Default product images (committed in repo — always available on deploy)
const staticCache = { maxAge: '7d', immutable: false };

app.use('/uploads/products', express.static(path.join(__dirname, '../seed-assets/products'), staticCache));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), staticCache));

app.get('/api/health', async (req, res) => {
  try {
    const integrations = await getIntegrationStatus();
    res.json({
      success: true,
      message: 'Karyor API is running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      integrations,
    });
  } catch (err) {
    res.json({
      success: true,
      message: 'Karyor API is running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      integrationsError: err.message,
    });
  }
});

// Friendly root route (prevents 404 spam when visiting base URL)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Karyor API is running 🚀',
    environment: process.env.NODE_ENV || 'production',
    healthCheck: '/api/health',
    allowedOrigins,
    note: 'This is the backend API. Frontend is served separately. Check /api/health for more info.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/location', require('./routes/locationRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const runSeed = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    console.warn(`[Seed] ${label} skipped:`, err.message);
  }
};

const logProductionEnvCheck = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'SETTINGS_ENCRYPTION_KEY',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SHIPROCKET_EMAIL',
    'SHIPROCKET_PASSWORD',
    'API_PUBLIC_URL',
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    console.warn('⚠️  Missing production env vars:', missing.join(', '));
  }
};

const startServer = async () => {
  logProductionEnvCheck();
  await connectDB();
  await runSeed('products', seedProducts);
  await runSeed('admin', seedAdmin);
  await runSeed('settings', seedSettings);
  await runSeed('content', seedContent);
  await runSeed('reviews', seedReviews);
  await runSeed('shiprocket', seedShiprocket);
  await runSeed('payment-gateways', seedPaymentGateways);
  await runSeed('site-images', seedSiteImages);

  app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    const publicUrl = getPublicApiBaseUrl({ preferPublic: true });

    console.log('\n' + '═'.repeat(58));
    console.log(`🚀  KARYOR API SERVER RUNNING  [${env.toUpperCase()}]`);
    console.log('═'.repeat(58));

    if (env === 'production') {
      console.log(`   📡  Port:          ${PORT}`);
      if (publicUrl) console.log(`   🌐  Public URL:    ${publicUrl}`);
      console.log(`   ❤️   Health:        ${publicUrl || ''}/api/health`);
      console.log('═'.repeat(58) + '\n');
      return;
    }

    console.log(`\n   📡  API Server:     http://localhost:${PORT}`);
    console.log('\n   Local dev: npm run dev:local  (store + admin + API)\n');
    console.log('═'.repeat(58) + '\n');
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});