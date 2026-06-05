import React from "react";

function Checkout() {
  return (
    <>
      <style>{`
      
      .checkout-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:120px 20px 60px;
        color:white;
      }

      .checkout-container{
        max-width:1200px;
        margin:auto;
        display:grid;
        grid-template-columns:2fr 1fr;
        gap:30px;
      }

      .checkout-card,
      .order-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.2);
        border-radius:25px;
        padding:30px;
      }

      .checkout-title{
        color:#d4af37;
        margin-bottom:25px;
      }

      .form-group{
        margin-bottom:18px;
      }

      .form-group label{
        display:block;
        margin-bottom:8px;
      }

      .form-group input,
      .form-group textarea{
        width:100%;
        padding:14px;
        border-radius:12px;
        border:1px solid rgba(212,175,55,.2);
        background:#1b1b1b;
        color:white;
        outline:none;
      }

      .form-row{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:15px;
      }

      .order-item{
        display:flex;
        justify-content:space-between;
        margin-bottom:15px;
      }

      .total{
        border-top:1px solid rgba(255,255,255,.1);
        padding-top:15px;
        margin-top:15px;
        font-size:22px;
        font-weight:700;
        color:#d4af37;
      }

      .place-order-btn{
        width:100%;
        margin-top:25px;
        padding:16px;
        border:none;
        border-radius:50px;
        background:linear-gradient(
          135deg,
          #f7d76a,
          #d4af37
        );
        color:black;
        font-weight:700;
        cursor:pointer;
      }

      .place-order-btn:hover{
        transform:translateY(-3px);
      }

      @media(max-width:900px){
        .checkout-container{
          grid-template-columns:1fr;
        }

        .form-row{
          grid-template-columns:1fr;
        }
      }

      `}</style>

      <div className="checkout-page">

        <div className="checkout-container">

          <div className="checkout-card">

            <h2 className="checkout-title">
              Shipping Details
            </h2>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" placeholder="Enter phone number" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter email" />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea rows="4" placeholder="Enter address"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input type="text" />
              </div>
            </div>

          </div>

          <div className="order-card">

            <h2 className="checkout-title">
              Order Summary
            </h2>

            <div className="order-item">
              <span>500 ML Mustard Oil</span>
              <span>₹199</span>
            </div>

            <div className="order-item">
              <span>5 Litre Mustard Oil</span>
              <span>₹899</span>
            </div>

            <div className="order-item">
              <span>Delivery</span>
              <span>₹50</span>
            </div>

            <div className="total">
              Total : ₹1148
            </div>

            <button className="place-order-btn">
              Place Order
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default Checkout;