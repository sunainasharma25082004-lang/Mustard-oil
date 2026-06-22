const DEFAULT_SITE_IMAGES = {
  logo: '/logo.jpeg',
  heroDesktop: '/banner-img.png',
  heroMobile: '/banner-mobile.jpg',
  aboutImage: '/mustard-about.jpg',
  distributorHero: '/distributor-hero.jpg',
  distributorBanner: '/banner-img.png',
  distributorShowcase: [
    { image: '/product-1l.jpg', label: '1 Litre Pack' },
    { image: '/product-5l.jpg', label: '5 Litre Pack' },
    { image: '/mustard1ml.jpg', label: 'Premium Range' },
  ],
  distributorBenefits: [
    {
      image: '/bottle.png',
      title: 'Trusted Brand',
      text: 'High quality mustard oil with strong market demand.',
    },
    {
      image: '/product-1l.jpg',
      title: 'Business Growth',
      text: 'Expand your distribution network and profits.',
    },
    {
      image: '/product-5l.jpg',
      title: 'Full Support',
      text: 'Marketing and business assistance from our team.',
    },
    {
      image: '/bottle51.png',
      title: 'Reliable Supply',
      text: 'Consistent stock and fast delivery support.',
    },
  ],
};

const mergeSiteImages = (stored) => {
  if (!stored) return { ...DEFAULT_SITE_IMAGES };

  return {
    logo: stored.logo || DEFAULT_SITE_IMAGES.logo,
    heroDesktop: stored.heroDesktop || DEFAULT_SITE_IMAGES.heroDesktop,
    heroMobile: stored.heroMobile || DEFAULT_SITE_IMAGES.heroMobile,
    aboutImage: stored.aboutImage || DEFAULT_SITE_IMAGES.aboutImage,
    distributorHero: stored.distributorHero || DEFAULT_SITE_IMAGES.distributorHero,
    distributorBanner: stored.distributorBanner || DEFAULT_SITE_IMAGES.distributorBanner,
    distributorShowcase:
      stored.distributorShowcase?.length > 0
        ? stored.distributorShowcase
        : DEFAULT_SITE_IMAGES.distributorShowcase,
    distributorBenefits:
      stored.distributorBenefits?.length > 0
        ? stored.distributorBenefits
        : DEFAULT_SITE_IMAGES.distributorBenefits,
  };
};

module.exports = { DEFAULT_SITE_IMAGES, mergeSiteImages };