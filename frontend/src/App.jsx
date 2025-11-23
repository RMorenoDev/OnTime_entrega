import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTeams from './pages/AdminTeams';
import Reports from './pages/Reports';
import PrintableReport from './pages/PrintableReport';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Hook de autenticacion global
  const { isAuthenticated } = useAuth();

  return (
    // Rutas publicas y protegidas segun autenticacion
    <Routes>
      {/* Redireccion inicial segun estado de sesion */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      {/* Flujo de autenticacion */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Zona principal del empleado */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-requests"
        element={
          <ProtectedRoute>
            <LeaveRequests />
          </ProtectedRoute>
        }
      />
      {/* Reportes para empleados/supervisores/admin */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      {/* Vista imprimible de reportes */}
      <Route
        path="/reports/print"
        element={
          <ProtectedRoute>
            <PrintableReport />
          </ProtectedRoute>
        }
      />
      {/* Panel admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <ProtectedRoute>
            <AdminTeams />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
