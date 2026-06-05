import { Link } from "react-router-dom";
import "../styles/main.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
      <div className="container">

        {/* Logo Image */}
        <img
          src="/logo.jpeg"
          alt="Karyor Logo"
          className="navbar-logo"
        />

        {/* Text Logo */}
        <Link className="navbar-brand brand-logo" to="/">
          <span>KAR</span>YOR
        </Link>

        {/* Hamburger */}
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
              <Link className="nav-link custom-link" to="/distributor">
                Distributor
              </Link>
            </li>


            <li className="nav-item">
              <Link className="nav-link custom-link" to="/contact">
                Contact
              </Link>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;