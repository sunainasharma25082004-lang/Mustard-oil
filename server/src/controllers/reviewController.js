const Review = require('../models/Review');
const {
  sanitizeReviewText,
  sanitizeReviewName,
  sanitizeReviewLocation,
} = require('../utils/sanitizeReview');

const getApprovedReviews = async (req, res, next) => {
  try {
    const filter = req.user
      ? {
          $or: [
            { status: 'approved' },
            { status: 'pending', user: req.user._id },
          ],
        }
      : { status: 'approved' };

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .select('-moderatedBy -moderatedAt')
      .lean();

    const data = reviews.map((r) => ({
      ...r,
      isOwner: req.user ? r.user.toString() === req.user._id.toString() : false,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { text, rating, location, name } = req.body;

    const textResult = sanitizeReviewText(text);
    if (textResult.rejected) {
      return res.status(400).json({ success: false, message: textResult.reason });
    }

    const review = await Review.create({
      user: req.user._id,
      name: sanitizeReviewName(name || req.user.name),
      location: sanitizeReviewLocation(location),
      text: textResult.sanitized,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will appear after admin approval.',
      data: { ...review.toObject(), isOwner: true },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own review' });
    }

    const { text, rating, location, name } = req.body;
    const updates = {};

    if (text !== undefined) {
      const textResult = sanitizeReviewText(text);
      if (textResult.rejected) {
        return res.status(400).json({ success: false, message: textResult.reason });
      }
      updates.text = textResult.sanitized;
    }

    if (rating !== undefined) {
      updates.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    }

    if (location !== undefined) {
      updates.location = sanitizeReviewLocation(location);
    }

    if (name !== undefined) {
      updates.name = sanitizeReviewName(name);
    }

    updates.status = 'pending';
    updates.moderatedBy = undefined;
    updates.moderatedAt = undefined;

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updates, $unset: { moderatedBy: 1, moderatedAt: 1 } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Review updated. It will appear again after admin approval.',
      data: { ...updated.toObject(), isOwner: true },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own review' });
    }

    await review.deleteOne();

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status, moderatedBy: req.user._id, moderatedAt: new Date() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review moderated', data: review });
  } catch (error) {
    next(error);
  }
};

const deleteReviewAdmin = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  moderateReview,
  deleteReviewAdmin,
};