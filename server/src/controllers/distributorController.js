const Distributor = require('../models/Distributor');
const {
  isValidIndianPhone,
  isValidEmail,
  isValidName,
  normalizePhone,
} = require('../utils/formValidation');

const buildApprovalMessage = (name) =>
  `Congratulations ${name}! You have been added as an authorized KARYOR Mustard Oil distributor. Welcome to the Karyor family!`;

const buildWhatsAppUrl = (phone, message) => {
  const digits = String(phone).replace(/\D/g, '');
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

const createDistributor = async (req, res, next) => {
  try {
    const { name, phone, email, city, state, business, experience, investment } = req.body;

    if (!name || !phone || !email || !city || !state || !business || !experience || !investment) {
      return res.status(400).json({
        success: false,
        message: 'All application fields are required',
      });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Enter a valid full name' });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }

    const normalizedPhone = normalizePhone(phone);

    const last10 = normalizedPhone.slice(-10);
    const existing = await Distributor.findOne({
      phone: { $regex: `${last10}$` },
      status: { $in: ['pending', 'reviewed', 'approved'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === 'approved'
            ? 'You are already registered as a Karyor distributor'
            : 'An application with this phone number is already under review',
      });
    }

    const application = await Distributor.create({
      name,
      phone,
      email,
      city,
      state,
      business,
      experience,
      investment,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message:
        'Distributor application submitted successfully. Our team will review it and you can check your status here.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getDistributorStatus = async (req, res, next) => {
  try {
    const last10 = normalizePhone(req.params.phone || '');

    if (!isValidIndianPhone(last10)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number',
      });
    }
    const application = await Distributor.findOne({
      phone: { $regex: `${last10}$` },
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No distributor application found for this phone number',
      });
    }

    let userMessage = 'Your application is under review. Please check back soon.';
    if (application.status === 'approved') {
      userMessage = buildApprovalMessage(application.name);
    } else if (application.status === 'rejected') {
      userMessage = 'Your distributor application was not approved at this time. Please contact Karyor support.';
    } else if (application.status === 'reviewed') {
      userMessage = 'Your application is being reviewed by our team.';
    }

    res.json({
      success: true,
      data: {
        name: application.name,
        status: application.status,
        message: userMessage,
        isApproved: application.status === 'approved',
        approvedAt: application.approvedAt,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllDistributors = async (req, res, next) => {
  try {
    const applications = await Distributor.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

const updateDistributorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await Distributor.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const previousStatus = application.status;
    application.status = status;

    if (status === 'approved') {
      application.approvedAt = application.approvedAt || new Date();
    } else if (status !== 'approved') {
      application.approvedAt = undefined;
    }

    if (req.body.userNotifiedAt) {
      application.userNotifiedAt = new Date();
    }

    await application.save();

    const response = {
      success: true,
      message: 'Distributor updated successfully',
      data: application,
    };

    if (status === 'approved' && previousStatus !== 'approved') {
      const approvalMessage = buildApprovalMessage(application.name);
      response.approvalMessage = approvalMessage;
      response.whatsappNotifyUrl = buildWhatsAppUrl(application.phone, approvalMessage);
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDistributor,
  getDistributorStatus,
  getAllDistributors,
  updateDistributorStatus,
};