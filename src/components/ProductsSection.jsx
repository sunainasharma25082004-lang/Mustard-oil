import React from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";

function ProductsSection() {
const products = [
  {
    id: 1,
    title: "500 ML",
    description: "Pure Kachi Ghani Mustard Oil",
    image: "/bottle.png",
    tag: "Best Seller",
  },
  {
    id: 2,
    title: "1 Litre",
    description: "Rich Aroma & Natural Purity",
    image: "/bottle.png",
    tag: "Popular",
  },
  {
    id: 3,
    title: "2 Litre",
    description: "Traditional Cold Pressed Process",
    image: "/bottle51.png",
    tag: "Family Pack",
  },
  {
    id: 4,
    title: "5 Litre",
    description: "Premium Economy Pack",
    image: "/product2.png",
    tag: "Premium",
  },
];

return (
<> 


  <section className="premium-products">

    <div className="container">

      <div className="premium-heading">
        <span>OUR COLLECTION</span>

        <h2>
          Premium Mustard Oil Products
        </h2>

        <p>
          Crafted from carefully selected mustard seeds,
          delivering purity, aroma and authentic taste.
        </p>
      </div>

      <div className="row g-4 align-items-stretch">

        {products.map((product) => (
          <div
            className="col-lg-3 col-md-6"
            key={product.id}
          >
            <div className="premium-card">

              <div className="premium-card-bg"></div>

              <div className="premium-tag">
                {product.tag}
              </div>

              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.title}
                />
              </div>

              <div className="product-content">

                <h4>{product.title}</h4>

                <p>
                  {product.description}
                </p>

                <Link
                  to="/products"
                  className="premium-btn"
                >
                  View Product
                </Link>

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

export default ProductsSection;
