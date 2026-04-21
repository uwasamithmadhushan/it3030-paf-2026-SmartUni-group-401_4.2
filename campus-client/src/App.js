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
};

function App() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes key={user?.id}>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Main Layout Wrapper */}
          <Route element={<ProtectedRoute><MainLayout><DashboardRedirect /></MainLayout></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>

          {/* Profile Hub */}
          <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Facilities & Assets */}
          <Route path="/facilities" element={<ProtectedRoute><MainLayout><AssetList /></MainLayout></ProtectedRoute>} />
          <Route path="/facilities/add" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AssetForm /></MainLayout></ProtectedRoute>} />
          <Route path="/facilities/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AssetForm /></MainLayout></ProtectedRoute>} />

          {/* Incident Tickets */}
          <Route path="/tickets" element={<ProtectedRoute><MainLayout><TicketListPage /></MainLayout></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><UserListPage /></MainLayout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
