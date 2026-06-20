import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminContacts from './pages/AdminContacts';
import AdminDistributors from './pages/AdminDistributors';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import AdminPaymentGateways from './pages/AdminPaymentGateways';
import AdminShippingSettings from './pages/AdminShippingSettings';
import AdminYouTube from './pages/AdminYouTube';
import AdminRecipes from './pages/AdminRecipes';
import AdminCertificates from './pages/AdminCertificates';
import AdminTestimonials from './pages/AdminTestimonials';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="distributors" element={<AdminDistributors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="payment-gateways" element={<AdminPaymentGateways />} />
            <Route path="shipping" element={<AdminShippingSettings />} />
            <Route path="youtube" element={<AdminYouTube />} />
            <Route path="recipes" element={<AdminRecipes />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;