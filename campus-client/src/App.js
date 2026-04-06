import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserListPage from './pages/UserListPage';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';

function App() {
  return (
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
                <DashboardPage />
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

          {/* Admin only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserListPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

