import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Componente de Ruta Protegida
 * Redirige a login si el usuario no está autenticado
 * Muestra loading mientras verifica autenticación
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth(); // Estado global de auth

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
