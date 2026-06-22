const Contact = require('../models/Contact');
const {
  isValidIndianPhone,
  isValidEmail,
  isValidName,
} = require('../utils/formValidation');

const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and message are required',
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

    if (String(message).trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters',
      });
    }

    const contact = await Contact.create({ name, email, phone, message });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

const updateContactStatus = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact updated',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createContact, getAllContacts, updateContactStatus };