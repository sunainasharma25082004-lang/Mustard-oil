const User = require('../models/User');
const {
  ADMIN_PERMISSIONS,
  DEPARTMENT_PRESETS,
  sanitizePermissions,
} = require('../utils/adminPermissions');

const formatStaffUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  department: user.department || '',
  adminPermissions: user.adminPermissions || [],
  isSuperAdmin: Boolean(user.isSuperAdmin),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getPermissionCatalog = async (req, res) => {
  res.json({
    success: true,
    data: {
      permissions: ADMIN_PERMISSIONS,
      departmentPresets: DEPARTMENT_PRESETS,
    },
  });
};

const getAdminTeam = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'admin' })
      .select('name email department adminPermissions isSuperAdmin createdAt updatedAt')
      .sort({ isSuperAdmin: -1, createdAt: 1 });

    res.json({
      success: true,
      data: staff.map(formatStaffUser),
    });
  } catch (error) {
    next(error);
  }
};

const createAdminStaff = async (req, res, next) => {
  try {
    const { name, email, password, department, adminPermissions } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const permissions = sanitizePermissions(adminPermissions);
    if (!permissions.length) {
      return res.status(400).json({
        success: false,
        message: 'Select at least one section for this team member',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      isSuperAdmin: false,
      department: department?.trim() || '',
      adminPermissions: permissions,
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: formatStaffUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    if (user.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin permissions cannot be changed here',
      });
    }

    const { name, password, department, adminPermissions } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (department !== undefined) user.department = String(department).trim();

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }
      user.password = password;
    }

    if (adminPermissions !== undefined) {
      const permissions = sanitizePermissions(adminPermissions);
      if (!permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Select at least one section for this team member',
        });
      }
      user.adminPermissions = permissions;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: formatStaffUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    if (user.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin account cannot be removed',
      });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own account',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPermissionCatalog,
  getAdminTeam,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
};