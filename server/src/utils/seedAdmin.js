const User = require('../models/User');

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email) {
    console.log('Admin seed skipped: ADMIN_EMAIL not set');
    return;
  }

  let user = await User.findOne({ email });

  if (!user) {
    if (!password) {
      console.log(`Admin seed skipped: ${email} not found and ADMIN_PASSWORD not set`);
      return;
    }

    await User.create({ name, email, password, role: 'admin', isSuperAdmin: true });
    console.log(`Super Admin user created: ${email}`);
    return;
  }

  let changed = false;

  if (user.role !== 'admin') {
    user.role = 'admin';
    changed = true;
  }

  if (!user.isSuperAdmin) {
    user.isSuperAdmin = true;
    changed = true;
  }

  if (name && user.name !== name) {
    user.name = name;
    changed = true;
  }

  if (changed) {
    await user.save();
    console.log(`Ensured Super Admin: ${email}`);
  }
};

module.exports = seedAdmin;