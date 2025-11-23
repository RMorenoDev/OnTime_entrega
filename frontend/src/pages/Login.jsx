import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/ontime_logo.png';
import '../index.css';

export default function Login() {
    const [email, setEmail] = useState(''); // Input email
    const [password, setPassword] = useState(''); // Input password
    const [errors, setErrors] = useState({}); // Errores de validacion/API
    const [loading, setLoading] = useState(false); // Estado de envio
    const { login } = useAuth();
    const navigate = useNavigate();

    // Enviar formulario de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors(result.errors);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <img src={logo} alt="OnTime Logo" style={{ width: '32px', height: '32px' }} />
                        OnTime
                    </h1>
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para continuar en tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="tu@ejemplo.com"
                        />
                        {errors.email && <span className="error-text">{errors.email[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Ingresa tu contraseña"
                        />
                        {errors.password && <span className="error-text">{errors.password[0]}</span>}
                    </div>

                    {errors.message && (
                        <div className="error-message">{errors.message}</div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="link">
                            Crear cuenta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
