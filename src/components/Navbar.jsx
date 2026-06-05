import { Link } from "react-router-dom";
import "../styles/main.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand brand-logo" to="/">
          <span>KAR</span>YOR
        </Link>

        {/* Premium Hamburger */}
        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link className="nav-link custom-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link custom-link" to="/about">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link custom-link" to="/products">
                Products
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link custom-link" to="/contact">
                Contact
              </Link>
            </li>

            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <Link className="btn contact-btn" to="/signin ">
                Sign In
              </Link>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;