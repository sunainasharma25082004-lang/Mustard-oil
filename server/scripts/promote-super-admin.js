/**
 * One-time script: ensure ADMIN_EMAIL is Super Admin in MongoDB.
 * Usage: node scripts/promote-super-admin.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.local'), override: true });

const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

async function main() {
  if (!email) {
    console.error('ADMIN_EMAIL is not set in server/.env');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error('Create the account first or set ADMIN_PASSWORD and restart the server.');
    process.exit(1);
  }

  user.role = 'admin';
  user.isSuperAdmin = true;
  await user.save();

  console.log(`Done — ${email} is now Super Admin (role: admin, isSuperAdmin: true)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});