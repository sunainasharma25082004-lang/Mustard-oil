import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Products() {

  const navigate = useNavigate(); 

  const products = [
    {
      title: "500 ML",
      image: "/bottle.png",
      desc: "Pure Kachi Ghani Mustard Oil",
      badge: "Best Seller",
    },
    {
      title: "5 Litre",
      image: "/bottle51.png",
      desc: "Family Pack Mustard Oil",
      badge: "Premium Pack",
    },
  ];

  return (
    <>
      <Navbar />

      <section className="premium-products-page">
        <div className="container">

          <div className="products-heading">
            <span>PREMIUM COLLECTION</span>
            <h1>Our Products</h1>
            <p>
              Experience the purity of traditional Kachi Ghani Mustard Oil
              crafted with quality, nutrition and trust.
            </p>
          </div>

          <div className="row g-4 justify-content-center">

            {products.map((item, index) => (
              <div className="col-lg-5 col-md-6" key={index}>
                <div className="premium-product-card">

                  <div className="product-badge">
                    {item.badge}
                  </div>

                  <div className="product-image-box">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="img-fluid"
                    />
                  </div>

                  <div className="product-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>

                    <button  onClick={() => navigate("/addcart")} 
                    className="golden-btn">
                      Add to Cart
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>

        </div>
      </section>
    </>
  );
}

export default Products;