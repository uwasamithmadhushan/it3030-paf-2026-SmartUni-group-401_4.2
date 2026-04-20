import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserDashboardPage from './pages/UserDashboardPage';
import UserListPage from './pages/UserListPage';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianAssignmentsPage from './pages/TechnicianAssignmentsPage';
import TechnicianSchedulePage from './pages/TechnicianSchedulePage';
import TechnicianReportsPage from './pages/TechnicianReportsPage';
import TechnicianMessagesPage from './pages/TechnicianMessagesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMessagesPage from './pages/AdminMessagesPage';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboardPage />;
  return <UserDashboardPage />;
}

function App() {
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

          {/* Admin only */}
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout><AdminBookings /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout><UserListPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout><AdminDashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout><AdminMessagesPage /></MainLayout>
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

          {/* Technician Specific Pages */}
          <Route path="/assignments" element={<ProtectedRoute><MainLayout><TechnicianAssignmentsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><MainLayout><TechnicianSchedulePage /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><TechnicianReportsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MainLayout><TechnicianMessagesPage /></MainLayout></ProtectedRoute>} />


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

