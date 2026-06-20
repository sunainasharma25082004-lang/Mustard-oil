import { lazy, Suspense, useCallback, useState } from 'react';
import Hero from '../components/Hero';
import ProductsSection from '../components/ProductsSection';
import AboutSection from '../components/AboutSection';
import QualityHighlights from '../components/QualityHighlights';
import CertificatesSection from '../components/CertificatesSection';
import YouTubeSection from '../components/YouTubeSection';
import CustomerTestimonials from '../components/CustomerTestimonials';
import DeferredSection from '../components/DeferredSection';
import { contentApi } from '../utils/api';
import { useLiveData } from '../hooks/useLiveData';

const Testimonials = lazy(() => import('../components/Testimonials'));

const emptyBundle = {
  products: [],
  certificates: [],
  youtube: [],
  testimonials: [],
};

function Home() {
  const [bundle, setBundle] = useState(null);

  const loadBundle = useCallback(() => {
    contentApi
      .getHomeBundle()
      .then((res) => setBundle(res.data || emptyBundle))
      .catch(() => setBundle(emptyBundle));
  }, []);

  useLiveData(loadBundle);

  return (
    <>
      <Hero />
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
      <DeferredSection minHeight={400}>
        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>
      </DeferredSection>
    </>
  );
}

export default Home;