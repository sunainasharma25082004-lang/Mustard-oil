import { useNavigate } from 'react-router-dom';
import { DELIVERY_CHARGE, useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/imageUrl';

function AddCart() {
  const navigate = useNavigate();
  const { items, subtotal, total, updateQuantity, removeFromCart } = useCart();

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
        display:flex;
        align-items:center;
        gap:10px;
        background:#1d1d1d;
        padding:10px 15px;
        border-radius:10px;
        border:1px solid rgba(212,175,55,.15);
      }

      .qty-btn{
        background:transparent;
        border:1px solid #d4af37;
        color:#d4af37;
        width:30px;
        height:30px;
        border-radius:8px;
        cursor:pointer;
      }

      .remove-btn{
        background:transparent;
        border:none;
        color:#ff6b6b;
        cursor:pointer;
        font-size:14px;
      }

      .empty-cart{
        text-align:center;
        padding:60px 20px;
        color:#bdbdbd;
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

      .checkout-btn:disabled{
        opacity:0.5;
        cursor:not-allowed;
      }

      .checkout-btn:hover:not(:disabled){
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

          {items.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p style={{ marginTop: 10 }}>Add some premium mustard oil to get started.</p>
              <button
                onClick={() => navigate('/products')}
                className="continue-btn"
                style={{ maxWidth: 250, margin: '30px auto 0' }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-grid">

              <div className="cart-items">

                {items.map((item) => (
                  <div className="cart-card" key={item._id}>

                    <img src={resolveImageUrl(item.image)} alt={item.name} />

                    <div className="cart-info">
                      <h3>{item.name}</h3>
                      <div className="cart-price">₹{item.price}</div>
                    </div>

                    <div className="qty-box">
                      <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>

                    <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                      Remove
                    </button>

                  </div>
                ))}

              </div>

              <div className="summary-card">

                <h2>Order Summary</h2>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <span>₹{DELIVERY_CHARGE}</span>
                </div>

                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="checkout-btn"
                >
                  Proceed to Checkout
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#777', marginTop: 10 }}>
                  You'll sign in securely before payment to track your order
                </p>

                <button onClick={() => navigate('/products')} className="continue-btn">
                  Continue Shopping
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
    </>
  );
}

export default AddCart;