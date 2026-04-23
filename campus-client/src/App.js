import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { ToastProvider } from './context/ToastContext';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// Dashboards
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const TechnicianDashboardPage = lazy(() => import('./pages/TechnicianDashboardPage'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));

// Management
const UserListPage = lazy(() => import('./pages/UserListPage'));
const AssetList = lazy(() => import('./pages/AssetList'));
const AssetForm = lazy(() => import('./pages/AssetForm'));
const TicketListPage = lazy(() => import('./pages/TicketListPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const TicketDetailsPage = lazy(() => import('./pages/TicketDetailsPage'));
const CreateTicketPage = lazy(() => import('./pages/CreateTicketPage'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const TechnicianAssignmentsPage = lazy(() => import('./pages/TechnicianAssignmentsPage'));
const TechnicianSchedulePage = lazy(() => import('./pages/TechnicianSchedulePage'));
const AssignedTicketsPage = lazy(() => import('./pages/AssignedTicketsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ResourceListPage = lazy(() => import('./pages/ResourceListPage'));
const ResourceDetailsPage = lazy(() => import('./pages/ResourceDetailsPage'));
const AdminResourcePage = lazy(() => import('./pages/AdminResourcePage'));


const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <UserDashboardPage />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Initializing SmartUni OS..." />}>
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
        <Route path="/schedule" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><TechnicianSchedulePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><PerformancePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><PlaceholderPage title="System Configuration" /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
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
