const User = require('../models/User');
const {
  isValidIndianPhone,
  isValidPincode,
  isValidEmail,
  isValidName,
  normalizePhone,
} = require('../utils/formValidation');
const generateToken = require('../utils/generateToken');
const { getEffectivePermissions } = require('../utils/adminPermissions');
const {
  isGoogleAuthConfigured,
  verifyGoogleIdToken,
  getSuggestedGoogleOrigins,
} = require('../utils/googleAuth');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, city, pincode } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and password are required',
      });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Enter a valid name' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number',
      });
    }

    if (pincode?.trim() && !isValidPincode(pincode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({
      name,
      email,
      phone: normalizePhone(phone),
      password,
      address: address?.trim() || '',
      city: city?.trim() || '',
      pincode: pincode?.trim() || '',
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
  pincode: user.pincode || '',
  role: user.role,
  isSuperAdmin: Boolean(user.isSuperAdmin),
  department: user.department || '',
  adminPermissions: user.adminPermissions || [],
  permissions: user.role === 'admin' ? getEffectivePermissions(user) : [],
  authProvider: user.authProvider || 'local',
  hasGoogle: Boolean(user.googleId),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getGoogleConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: isGoogleAuthConfigured(),
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() || null,
      authorizedOriginsHint: getSuggestedGoogleOrigins(),
      setupNote:
        'Google Cloud → Credentials → OAuth 2.0 Web client (type: Web application) → Authorized JavaScript origins. Use https://karyor.com NOT karyor.com. Add both https://karyor.com and https://www.karyor.com. Save, wait 5 minutes.',
      clientIdSuffix: process.env.GOOGLE_CLIENT_ID?.trim().slice(-20) || null,
    },
  });
};

const googleAuth = async (req, res, next) => {
  try {
    if (!isGoogleAuthConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Google sign-in is not configured yet',
      });
    }

    const { credential } = req.body;
    if (!credential?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    let profile;
    try {
      profile = await verifyGoogleIdToken(credential.trim());
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message || 'Google sign-in verification failed',
      });
    }

    if (!profile.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your Google email address first',
      });
    }

    let user = await User.findOne({
      $or: [{ googleId: profile.googleId }, { email: profile.email }],
    }).select('+password');

    if (user?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts must use the admin panel login',
      });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.googleId;
        user.authProvider = user.password ? 'both' : 'google';
      }
      if (profile.name && (!user.name || user.name === user.email.split('@')[0])) {
        user.name = profile.name;
      }
      await user.save();
    } else {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        authProvider: 'google',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Signed in with Google',
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: formatUser(req.user),
    },
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, pincode } = req.body;
    const user = req.user;

    if (name !== undefined) {
      if (!isValidName(name)) {
        return res.status(400).json({ success: false, message: 'Enter a valid name' });
      }
      user.name = name.trim();
    }
    if (phone !== undefined) {
      const trimmedPhone = String(phone || '').trim();
      if (!trimmedPhone) {
        user.phone = '';
      } else if (!isValidIndianPhone(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Enter a valid 10-digit Indian mobile number',
        });
      } else {
        user.phone = normalizePhone(trimmedPhone);
      }
    }
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (pincode !== undefined) {
      if (pincode.trim() && !isValidPincode(pincode)) {
        return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode' });
      }
      user.pincode = pincode.trim();
    }

    if (!user.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: formatUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google sign-in accounts cannot change password here',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  googleAuth,
  getGoogleConfig,
};