import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnimatedPage from './components/AnimatedPage';

import { ToastProvider } from './context/ToastContext';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';

import AdminDashboardPage from './pages/AdminDashboardPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserListPage from './pages/UserListPage';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import TicketListPage from './pages/TicketListPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotificationsPage from './pages/NotificationsPage';
import PerformancePage from './pages/PerformancePage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import TechnicianAssignmentsPage from './pages/TechnicianAssignmentsPage';
import TechnicianSchedulePage from './pages/TechnicianSchedulePage';
import AssignedTicketsPage from './pages/AssignedTicketsPage';
import ProfilePage from './pages/ProfilePage';
import ResourceListPage from './pages/ResourceListPage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AdminResourcePage from './pages/AdminResourcePage';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <UserDashboardPage />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getRouteKey = () => {
    const path = location.pathname;
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return 'app'; // Shared key for all protected routes to prevent MainLayout remount
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={getRouteKey()}>
        {/* Public */}
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />

        {/* Protected Main Layout Wrapper */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* Profile Hub */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Facilities & Assets */}
          <Route path="/facilities" element={<AssetList />} />
          <Route path="/facilities/add" element={<ProtectedRoute allowedRoles={['ADMIN']}><AssetForm /></ProtectedRoute>} />
          <Route path="/facilities/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AssetForm /></ProtectedRoute>} />

          {/* Member 1: Resource Management Module */}
          <Route path="/resources" element={<ResourceListPage />} />
          <Route path="/resources/:id" element={<ResourceDetailsPage />} />
          <Route path="/admin/resources/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminResourcePage /></ProtectedRoute>} />
          <Route path="/admin/resources/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminResourcePage /></ProtectedRoute>} />

          {/* Incident Tickets */}
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />

          {/* Bookings */}
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/bookings/new" element={<BookingForm />} />
          <Route path="/facilities/:id/book" element={<BookingForm />} />

          {/* Admin only */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserListPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/assignments" element={<ProtectedRoute allowedRoles={['ADMIN']}><TechnicianAssignmentsPage /></ProtectedRoute>} />
          <Route path="/admin/facilities" element={<ProtectedRoute allowedRoles={['ADMIN']}><AssetList /></ProtectedRoute>} />

          {/* Technician only */}
          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><AssignedTicketsPage /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><TechnicianSchedulePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PerformancePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><PlaceholderPage title="System Configuration" /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};



function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
