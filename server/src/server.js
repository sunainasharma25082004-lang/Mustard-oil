const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
require('dotenv').config();

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

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log blocked origins — very useful for debugging deploys
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(', ') || '(none set)'}`);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api', limiter);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Karyor API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  });
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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await seedProducts();
  await seedAdmin();
  await seedSettings();

  app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    console.log('\n' + '═'.repeat(58));
    console.log(`🚀  KARYOR API SERVER RUNNING  [${env.toUpperCase()}]`);
    console.log('═'.repeat(58));
    console.log('');
    console.log(`   📡  API Server:     http://localhost:${PORT}`);
    console.log('');
    console.log('   ⚠️  Admin Panel aur Store alag-alag apps hain.');
    console.log('');
    console.log('   🛠️   Admin Panel (http://localhost:5174) ke liye:');
    console.log('        npm run dev:admin');
    console.log('');
    console.log('   🛒  Store Frontend (http://localhost:5173) ke liye:');
    console.log('        npm run dev');
    console.log('');
    console.log('   ✅  Sab ek saath start karne ke liye (recommended):');
    console.log('        npm run dev:all');
    console.log('');
    console.log('   Press CTRL+C to stop this API server');
    console.log('═'.repeat(58) + '\n');
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});