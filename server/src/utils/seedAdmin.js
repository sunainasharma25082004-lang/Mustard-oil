const User = require('../models/User');

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  const adminCount = await User.countDocuments({ role: 'admin' });

  if (adminCount === 0) {
    if (!email || !password) {
      console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
      return;
    }

    await User.create({ name, email, password, role: 'admin', isSuperAdmin: true });
    console.log(`Super Admin user created: ${email}`);
    return;
  }

  const superAdminCount = await User.countDocuments({ role: 'admin', isSuperAdmin: true });
  if (superAdminCount > 0) return;

  let candidate = null;

  if (email) {
    candidate = await User.findOne({ role: 'admin', email });
  }

  if (!candidate) {
    candidate = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
  }

  if (!candidate) return;

  candidate.isSuperAdmin = true;
  await candidate.save();
  console.log(`Promoted existing admin to Super Admin: ${candidate.email}`);
};

module.exports = seedAdmin;