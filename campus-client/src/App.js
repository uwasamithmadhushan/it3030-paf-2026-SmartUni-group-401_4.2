import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboards
import AdminDashboardPage from './pages/AdminDashboardPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';

// Management
import UserListPage from './pages/UserListPage';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import TicketListPage from './pages/TicketListPage';
import PlaceholderPage from './pages/PlaceholderPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import NewTicketPage from './pages/NewTicketPage';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import TechnicianAssignmentsPage from './pages/TechnicianAssignmentsPage';
import AssignedTicketsPage from './pages/AssignedTicketsPage';
import ProfilePage from './pages/ProfilePage';
import ResourceListPage from './pages/ResourceListPage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AdminResourcePage from './pages/AdminResourcePage';

import { ToastProvider } from './context/ToastContext';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <UserDashboardPage />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes key={user?.id}>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
        <Route path="/resolved" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PlaceholderPage title="Resolved Archive" /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PlaceholderPage title="Mission Schedule" /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PlaceholderPage title="Comm Center" /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PlaceholderPage title="Efficiency Analytics" /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><PlaceholderPage title="Specialist Profile" /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><PlaceholderPage title="System Configuration" /></ProtectedRoute>} />
        
        {/* Unified Ticket Redirect for Techs */}
        <Route path="/tickets" element={<TicketListPage />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
