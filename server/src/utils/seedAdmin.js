const User = require('../models/User');

const seedAdmin = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  await User.create({ name, email, password, role: 'admin', isSuperAdmin: true });
  console.log(`Super Admin user created: ${email}`);
};

module.exports = seedAdmin;