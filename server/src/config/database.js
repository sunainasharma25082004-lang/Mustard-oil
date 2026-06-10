const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
      console.error('   → Possible causes: Wrong MONGO_URI, IP not whitelisted in Atlas, or network issue.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;