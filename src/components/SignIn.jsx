import React, { useState } from "react";

function SignIn() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <style>{`

      .auth-page{
        min-height:100vh;
        background:#0b0b0b;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:40px 20px;
        position:relative;
        overflow:hidden;
      }

      .auth-page::before{
        content:"";
        position:absolute;
        width:500px;
        height:500px;
        border-radius:50%;
        background:rgba(212,175,55,.08);
        top:-200px;
        right:-150px;
        filter:blur(120px);
      }

      .auth-card{
        width:100%;
        max-width:500px;
        background:#141414;
        border:1px solid rgba(212,175,55,.2);
        border-radius:30px;
        padding:40px;
        position:relative;
        z-index:2;
        box-shadow:0 20px 50px rgba(0,0,0,.4);
      }

      .brand{
        text-align:center;
        margin-bottom:25px;
      }

      .brand h1{
        color:#d4af37;
        font-size:2.5rem;
        margin-bottom:10px;
      }

      .brand p{
        color:#bdbdbd;
      }

      .tab-buttons{
        display:flex;
        background:#1b1b1b;
        border-radius:50px;
        padding:5px;
        margin-bottom:30px;
      }

      .tab-btn{
        flex:1;
        border:none;
        background:transparent;
        color:#fff;
        padding:12px;
        border-radius:50px;
        cursor:pointer;
        transition:.3s;
      }

      .tab-btn.active{
        background:linear-gradient(
          135deg,
          #f5d76e,
          #d4af37
        );
        color:#000;
        font-weight:700;
      }

      .auth-input{
        width:100%;
        padding:15px 18px;
        margin-bottom:15px;
        border-radius:14px;
        border:1px solid rgba(212,175,55,.15);
        background:#1d1d1d;
        color:#fff;
        outline:none;
      }

      .auth-input:focus{
        border-color:#d4af37;
      }

      .auth-btn{
        width:100%;
        border:none;
        padding:15px;
        border-radius:50px;
        margin-top:10px;
        font-weight:700;
        background:linear-gradient(
          135deg,
          #f5d76e,
          #d4af37
        );
        color:#000;
        cursor:pointer;
        transition:.3s;
      }

      .auth-btn:hover{
        transform:translateY(-3px);
        box-shadow:0 10px 25px rgba(212,175,55,.35);
      }

      .auth-footer{
        text-align:center;
        margin-top:20px;
        color:#bdbdbd;
      }

      .auth-footer span{
        color:#d4af37;
        cursor:pointer;
        font-weight:600;
      }

      @media(max-width:576px){

        .auth-card{
          padding:25px;
        }

        .brand h1{
          font-size:2rem;
        }

      }

      `}</style>

      <div className="auth-page">

        <div className="auth-card">

          <div className="brand">
            <h1>Karyor</h1>
            <p>Premium Mustard Oil</p>
          </div>

          <div className="tab-buttons">

            <button
              className={`tab-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>

            <button
              className={`tab-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>

          </div>

          {isLogin ? (
            <form>

              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
              />

              <input
                type="password"
                placeholder="Password"
                className="auth-input"
              />

              <button className="auth-btn">
                Sign In
              </button>

            </form>
          ) : (
            <form>

              <input
                type="text"
                placeholder="Full Name"
                className="auth-input"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="auth-input"
              />

              <input
                type="password"
                placeholder="Password"
                className="auth-input"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="auth-input"
              />

              <button className="auth-btn">
                Create Account
              </button>

            </form>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <span onClick={() => setIsLogin(false)}>
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => setIsLogin(true)}>
                  Sign In
                </span>
              </>
            )}
          </div>

        </div>

      </div>
    </>
  );
}

export default SignIn;