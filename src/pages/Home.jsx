import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductsSection from "../components/ProductsSection";
import AboutSection from "../components/AboutSection";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import WhatsappButton from "../components/WhatsappButton";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <AboutSection />

      <ProductsSection />

      <Testimonials />

      <Footer />

      <WhatsappButton />
    </>
  );
}

export default Home;