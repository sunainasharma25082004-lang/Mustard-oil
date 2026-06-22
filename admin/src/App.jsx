import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminPermissionRoute from './components/AdminPermissionRoute';
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
import AdminSiteImages from './pages/AdminSiteImages';
import AdminTeam from './pages/AdminTeam';
import { useAuth } from './context/AuthContext';
import { getDefaultAdminPath } from './utils/permissions';

function AdminIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultAdminPath(user)} replace />;
}

function ProtectedPage({ permission, element }) {
  return <AdminPermissionRoute permission={permission}>{element}</AdminPermissionRoute>;
}

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
            <Route index element={<AdminIndexRedirect />} />
            <Route path="dashboard" element={<ProtectedPage permission="dashboard" element={<AdminDashboard />} />} />
            <Route path="products" element={<ProtectedPage permission="products" element={<AdminProducts />} />} />
            <Route path="orders" element={<ProtectedPage permission="orders" element={<AdminOrders />} />} />
            <Route path="contacts" element={<ProtectedPage permission="contacts" element={<AdminContacts />} />} />
            <Route path="distributors" element={<ProtectedPage permission="distributors" element={<AdminDistributors />} />} />
            <Route path="users" element={<ProtectedPage permission="users" element={<AdminUsers />} />} />
            <Route path="reviews" element={<ProtectedPage permission="reviews" element={<AdminReviews />} />} />
            <Route path="payment-gateways" element={<AdminPaymentGateways />} />
            <Route path="shipping" element={<ProtectedPage permission="shipping" element={<AdminShippingSettings />} />} />
            <Route path="youtube" element={<ProtectedPage permission="youtube" element={<AdminYouTube />} />} />
            <Route path="recipes" element={<ProtectedPage permission="recipes" element={<AdminRecipes />} />} />
            <Route path="certificates" element={<ProtectedPage permission="certificates" element={<AdminCertificates />} />} />
            <Route path="site-images" element={<ProtectedPage permission="site-images" element={<AdminSiteImages />} />} />
            <Route path="team" element={<AdminTeam />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;