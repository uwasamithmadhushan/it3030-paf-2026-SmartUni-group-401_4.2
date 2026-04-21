import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserListPage from './pages/UserListPage';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import TicketListPage from './pages/TicketListPage';
import DashboardPage from './pages/DashboardPage';

import { ToastProvider } from './context/ToastContext';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <UserDashboardPage />;
}

function App() {
  const { user } = useAuth();

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <ToastProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout><DashboardRouter /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout><ProfilePage /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Facilities & Assets */}
          <Route
            path="/facilities"
            element={
              <ProtectedRoute>
                <MainLayout><AssetList /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities/add"
            element={
              <ProtectedRoute>
                <MainLayout><AssetForm /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout><AssetForm /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Bookings */}
          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute>
                <MainLayout><BookingForm /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/my"
            element={
              <ProtectedRoute>
                <MainLayout><MyBookings /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Technician only */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <MainLayout><TechnicianAssignmentsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <MainLayout><TechnicianSchedulePage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <MainLayout><TechnicianReportsPage /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout><AdminBookings /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout><UserListPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout><AdminDashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Incident Tickets */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MainLayout><TicketListPage /></MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="new" element={<CreateTicketPage />} />
          </Route>
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <MainLayout><TicketDetailsPage /></MainLayout>
              </ProtectedRoute>
            }
          />


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

