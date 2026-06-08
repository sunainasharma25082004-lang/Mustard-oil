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
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
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
            </Route>
            <Route path="/signin" element={<Navigate to="/checkout" replace />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;