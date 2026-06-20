const Review = require('../models/Review');
const User = require('../models/User');

const defaultReviews = [
  {
    name: 'Anjali Sharma',
    location: 'Gurugram',
    text: 'The aroma and colour remind me of traditional ghani oil. My family noticed the difference within a week.',
    rating: 5,
  },
  {
    name: 'Dr. Rakesh Mehta',
    location: 'Noida',
    text: 'This is the first packaged Cold Pressed & Single Pressed Mustard Oil I confidently recommend.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    location: 'Delhi',
    text: 'Amazing flavour, amazing aroma. Worth every rupee.',
    rating: 5,
  },
];

const seedReviews = async () => {
  const count = await Review.countDocuments();
  if (count > 0) return;

  const seedUser = await User.findOne({ role: 'admin' });
  if (!seedUser) {
    console.log('Review seed skipped: admin user not found');
    return;
  }

  await Review.insertMany(
    defaultReviews.map((review) => ({
      ...review,
      user: seedUser._id,
      status: 'approved',
    }))
  );

  console.log(`Default reviews seeded (${defaultReviews.length})`);
};

module.exports = seedReviews;