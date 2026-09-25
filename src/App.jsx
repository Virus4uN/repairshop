import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import TechnicianLayout from './layouts/TechnicianLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import TrackRepairPage from './pages/public/TrackRepairPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookRepair from './pages/customer/BookRepair';
import MyRepairs from './pages/customer/MyRepairs';
import RepairDetails from './pages/customer/RepairDetails';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerManagement from './pages/admin/CustomerManagement';
import RepairManagement from './pages/admin/RepairManagement';
import RepairDetailAdmin from './pages/admin/RepairDetailAdmin';
import TechnicianManagement from './pages/admin/TechnicianManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import SparePartsManagement from './pages/admin/SparePartsManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import Reports from './pages/admin/Reports';

// Technician Pages
import TechDashboard from './pages/technician/TechDashboard';
import RepairWork from './pages/technician/RepairWork';

// Public layout wrapper
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

// Book repair - can be accessed both from public and customer portal
function BookRepairPublic() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BookRepair />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/track" element={<TrackRepairPage />} />
          </Route>

          {/* Auth Routes (no navbar/footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Public Book Repair */}
          <Route element={<PublicLayout />}>
            <Route path="/book-repair" element={<BookRepairPublic />} />
          </Route>

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="book-repair" element={<BookRepair />} />
            <Route path="my-repairs" element={<MyRepairs />} />
            <Route path="repairs/:id" element={<RepairDetails />} />
            <Route path="feedback" element={<CustomerFeedback />} />
            <Route path="feedback/:id" element={<CustomerFeedback />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="repairs" element={<RepairManagement />} />
            <Route path="repairs/:id" element={<RepairDetailAdmin />} />
            <Route path="technicians" element={<TechnicianManagement />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="spare-parts" element={<SparePartsManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="feedback" element={<FeedbackManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Technician Routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={['technician']}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TechDashboard />} />
            <Route path="repairs" element={<TechDashboard />} />
            <Route path="repairs/:id" element={<RepairWork />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;