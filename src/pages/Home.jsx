import Hero from "../components/Hero";
import ProductsSection from "../components/ProductsSection";
import AboutSection from "../components/AboutSection";
import Testimonials from "../components/Testimonials";

function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ProductsSection />
      <Testimonials />
    </>
  );
}

export default Home;