import React from "react";
import { useNavigate } from "react-router-dom";

function AddCart() {

  const navigate = useNavigate();   

  const products = [
    {
      id: 1,
      name: "500 ML Mustard Oil",
      price: "₹199",
      image: "/bottle.png",
      qty: 1,
    },
    {
      id: 2,
      name: "5 Litre Mustard Oil",
      price: "₹899",
      image: "/bottle5l.png",
      qty: 1,
    },
  ];

  return (
    <>
      <style>{`
      
      .cart-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:120px 20px 60px;
        color:white;
      }

      .cart-container{
        max-width:1200px;
        margin:auto;
      }

      .cart-title{
        text-align:center;
        margin-bottom:50px;
      }

      .cart-title h1{
        font-size:3rem;
        color:#d4af37;
        margin-bottom:10px;
      }

      .cart-title p{
        color:#bdbdbd;
      }

      .cart-grid{
        display:grid;
        grid-template-columns:2fr 1fr;
        gap:30px;
      }

      .cart-items{
        display:flex;
        flex-direction:column;
        gap:25px;
      }

      .cart-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.2);
        border-radius:20px;
        padding:20px;
        display:flex;
        align-items:center;
        gap:20px;
        transition:.4s;
      }

      .cart-card:hover{
        transform:translateY(-5px);
        border-color:#d4af37;
      }

      .cart-card img{
        width:120px;
        height:120px;
        object-fit:contain;
      }

      .cart-info{
        flex:1;
      }

      .cart-info h3{
        color:#fff;
        margin-bottom:10px;
      }

      .cart-price{
        color:#d4af37;
        font-size:22px;
        font-weight:700;
      }

      .qty-box{
        background:#1d1d1d;
        padding:10px 15px;
        border-radius:10px;
        border:1px solid rgba(212,175,55,.15);
      }

      .summary-card{
        background:#141414;
        border-radius:25px;
        padding:30px;
        border:1px solid rgba(212,175,55,.2);
        position:sticky;
        top:100px;
      }

      .summary-card h2{
        color:#d4af37;
        margin-bottom:25px;
      }

      .summary-row{
        display:flex;
        justify-content:space-between;
        margin-bottom:15px;
        color:#d0d0d0;
      }

      .summary-total{
        border-top:1px solid rgba(255,255,255,.1);
        padding-top:20px;
        margin-top:20px;
        font-size:22px;
        font-weight:700;
      }

      .checkout-btn{
        width:100%;
        margin-top:25px;
        padding:15px;
        border:none;
        border-radius:50px;
        font-weight:700;
        background:linear-gradient(
          135deg,
          #f7d76a,
          #d4af37
        );
        color:black;
        cursor:pointer;
        transition:.3s;
      }

      .checkout-btn:hover{
        transform:translateY(-3px);
        box-shadow:0 10px 25px rgba(212,175,55,.35);
      }

      .continue-btn{
        width:100%;
        margin-top:15px;
        padding:15px;
        border-radius:50px;
        background:transparent;
        color:#d4af37;
        border:1px solid #d4af37;
        cursor:pointer;
      }

      .continue-btn:hover{
        background:#d4af37;
        color:black;
      }

      @media(max-width:900px){

        .cart-grid{
          grid-template-columns:1fr;
        }

        .cart-card{
          flex-direction:column;
          text-align:center;
        }

        .cart-title h1{
          font-size:2.2rem;
        }
      }

      `}</style>

      <div className="cart-page">

        <div className="cart-container">

          <div className="cart-title">
            <h1>Shopping Cart</h1>
            <p>Your Premium Mustard Oil Collection</p>
          </div>

          <div className="cart-grid">

            <div className="cart-items">

              {products.map((item) => (
                <div className="cart-card" key={item.id}>

                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <div className="cart-price">{item.price}</div>
                  </div>

                  <div className="qty-box">
                    Qty: {item.qty}
                  </div>

                </div>
              ))}

            </div>

            <div className="summary-card">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹1098</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span>₹50</span>
              </div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹1148</span>
              </div>

              <button onClick={() => navigate("/checkout")}
              className="checkout-btn">
                Proceed to Checkout
              </button>

              <button onClick={() => navigate("/products")} className="continue-btn">
                Continue Shopping
              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default AddCart;