import { lazy, Suspense, useCallback, useState } from 'react';
import Hero from '../components/Hero';
import KitchenExperienceSection from '../components/KitchenExperienceSection';
import ProductsSection from '../components/ProductsSection';
import AboutSection from '../components/AboutSection';
import QualityHighlights from '../components/QualityHighlights';
import CertificatesSection from '../components/CertificatesSection';
import YouTubeSection from '../components/YouTubeSection';
import CustomerTestimonials from '../components/CustomerTestimonials';
import DeferredSection from '../components/DeferredSection';
import { contentApi } from '../utils/api';
import { useLiveData } from '../hooks/useLiveData';
import { readCache, writeCache } from '../utils/storeCache';

const HOME_CACHE_KEY = 'home-bundle';
const CACHE_TTL_MS = 5 * 60 * 1000;

const Testimonials = lazy(() => import('../components/Testimonials'));

const emptyBundle = {
  products: [],
  certificates: [],
  youtube: [],
  testimonials: [],
};

function Home() {
  const [bundle, setBundle] = useState(() => readCache(HOME_CACHE_KEY, CACHE_TTL_MS));

  const loadBundle = useCallback(() => {
    const cached = readCache(HOME_CACHE_KEY, CACHE_TTL_MS);
    if (cached) setBundle(cached);

    contentApi
      .getHomeBundle()
      .then((res) => {
        const data = res.data || emptyBundle;
        setBundle(data);
        writeCache(HOME_CACHE_KEY, data);
      })
      .catch(() => {
        if (!cached) setBundle(emptyBundle);
      });
  }, []);

  useLiveData(loadBundle);

  return (
    <>
      <Hero />
      <KitchenExperienceSection />
      <QualityHighlights />
      <AboutSection />
      <ProductsSection products={bundle?.products} />
      <DeferredSection minHeight={280}>
        <CertificatesSection items={bundle?.certificates} />
      </DeferredSection>
      <DeferredSection minHeight={200}>
        <YouTubeSection items={bundle?.youtube} />
      </DeferredSection>
      <DeferredSection minHeight={320}>
        <CustomerTestimonials items={bundle?.testimonials} />
      </DeferredSection>
      <DeferredSection minHeight={400} anchorId="reviews">
        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>
      </DeferredSection>
    </>
  );
}

export default Home;