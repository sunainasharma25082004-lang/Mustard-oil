import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import AddCart from "./components/AddCart";
import Checkout from "./components/Checkout";
import Distributor from "./components/Distributor";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import SignIn from "./components/SignIn";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import GoogleAuthProvider from "./components/GoogleAuthProvider";

function App() {
  return (
    <GoogleAuthProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/addcart" element={<AddCart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/distributor" element={<Distributor />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:slug" element={<RecipeDetail />} />
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            {/* SPA catch-all: after the static site rewrite serves index.html, React Router shows this for truly unknown paths */}
            <Route
              path="*"
              element={
                <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                  <h2>404 — Page Not Found</h2>
                  <p>The page you’re looking for doesn’t exist or has been moved.</p>
                  <a href="/" style={{ marginTop: '1rem', color: '#d4af37', textDecoration: 'underline' }}>Go back to Home</a>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </GoogleAuthProvider>
  );
}

export default App;