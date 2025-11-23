import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import logo from '../assets/ontime_logo.png';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSession, setActiveSession] = useState(null); // Sesion de trabajo en curso
    const [activeBreak, setActiveBreak] = useState(null); // Pausa activa
    const [loading, setLoading] = useState(false); // Estados de botones
    const [error, setError] = useState(''); // Mensaje de error en pantalla

    // Obtener sesion de trabajo activa
    const fetchActiveSession = async () => {
        try {
            const response = await api.get('/work-sessions/active');
            const session = response.data.session;
            setActiveSession(session);

            // Verificar si hay una pausa activa
            if (session?.breaks) {
                const currentBreak = session.breaks.find(b => !b.ended_at);
                setActiveBreak(currentBreak || null);
            }
        } catch (err) {
            console.error('Error fetching session:', err);
        }
    };

    useEffect(() => {
        fetchActiveSession(); // Primer fetch al montar
        const interval = setInterval(fetchActiveSession, 30000); // Refrescar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    // Inicia la jornada
    const handleClockIn = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/work-sessions/clock-in');
            setActiveSession(response.data.session);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al fichar entrada');
        } finally {
            setLoading(false);
        }
    };

    // Cierra la jornada
    const handleClockOut = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/work-sessions/clock-out');
            setActiveSession(null);
            setActiveBreak(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al fichar salida');
        } finally {
            setLoading(false);
        }
    };

    // Inicia una pausa
    const handleStartBreak = async (breakType, isPaid) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/breaks/start', {
                break_type: breakType,
                is_paid: isPaid,
            });
            setActiveBreak(response.data.break);
            await fetchActiveSession(); // Refresh para obtener pausas actualizadas
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar pausa');
        } finally {
            setLoading(false);
        }
    };

    // Finaliza la pausa activa
    const handleEndBreak = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/breaks/end');
            setActiveBreak(null);
            await fetchActiveSession(); // Refresh para obtener pausas actualizadas
        } catch (err) {
            setError(err.response?.data?.message || 'Error al finalizar pausa');
        } finally {
            setLoading(false);
        }
    };

    // Calcula la duracion de la pausa en curso
    const getBreakDuration = () => {
        if (!activeBreak?.started_at) return '00:00:00';
        const start = new Date(activeBreak.started_at);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000); // seconds
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const [timer, setTimer] = useState(getBreakDuration()); // Contador visible de la pausa

    useEffect(() => {
        if (activeBreak && !activeBreak.ended_at) {
            const interval = setInterval(() => {
                setTimer(getBreakDuration()); // Actualiza cada segundo
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeBreak]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={logo} alt="OnTime Logo" style={{ width: '32px', height: '32px' }} />
                            OnTime
                        </h1>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>¡Bienvenido de nuevo, {user?.name}!</h2>
                        <p className="user-email" style={{ margin: '0.5rem 0 0.25rem' }}>{user?.email}</p>
                        <p style={{ margin: 0, color: 'var(--gray-light)', fontSize: '0.9rem' }}>
                            {user?.role} {user?.team && `• ${user.team.name}`}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem' }}>
                        {user?.role === 'admin' && (
                            <button onClick={() => navigate('/admin')} className="btn-secondary">
                                Panel de admin
                            </button>
                        )}
                        <button onClick={() => navigate('/reports')} className="btn-secondary">
                            Reportes
                        </button>
                        <button onClick={() => navigate('/leave-requests')} className="btn-secondary">
                            Permisos
                        </button>
                        <button onClick={logout} className="btn-secondary">
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message" style={{ marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                {/* Tarjeta de sesion de trabajo */}
                <div className="work-session-card">
                    <h3 style={{ textAlign: 'center' }}>Sesión de trabajo</h3>

                    {!activeSession ? (
                        <div className="status-section">
                            <p className="status-text">No has fichado</p>
                            <button
                                onClick={handleClockIn}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Fichando entrada...' : 'Fichar entrada'}
                            </button>
                        </div>
                    ) : (
                        <div className="active-session">
                            {!activeBreak ? (
                                <>
                                    <div className="session-info">
                                        <div className="status-badge working">Trabajando</div>
                                        <p className="session-start">
                                            Entrada a las {new Date(activeSession.started_at).toLocaleTimeString()}
                                        </p>
                                    </div>

                                    <div className="break-controls">
                                        <h4 style={{ textAlign: 'center' }}>Tomar una pausa</h4>
                                        <div className="break-buttons">
                                            <button
                                                onClick={() => handleStartBreak('coffee', true)}
                                                className="btn-break"
                                                disabled={loading}
                                            >
                                                ☕ Café
                                            </button>
                                            <button
                                                onClick={() => handleStartBreak('snack', true)}
                                                className="btn-break"
                                                disabled={loading}
                                            >
                                                🍪 Snack
                                            </button>
                                            <button
                                                onClick={() => handleStartBreak('personal', false)}
                                                className="btn-break"
                                                disabled={loading}
                                            >
                                                🙋 Personal
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleStartBreak('split_shift', true)}
                                            className="btn-break-large"
                                            disabled={loading}
                                        >
                                            🍽️  Turno partido
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="active-break">
                                    <div className={`status-badge ${activeBreak.break_type === 'split_shift' ? 'long-break' : 'break'}`}>
                                        {activeBreak.break_type === 'split_shift' ? 'Pausa larga' : 'En pausa'}
                                    </div>

                                    {activeBreak.break_type === 'split_shift' ? (
                                        <div className="split-shift-info">
                                            <p className="session-start">
                                                Entrada: {new Date(activeSession.started_at).toLocaleTimeString()}
                                            </p>
                                            <p className="session-start">
                                                Pausa iniciada: {new Date(activeBreak.started_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="timer-display">
                                                <div className="timer">{timer}</div>
                                            </div>
                                            <p>Tipo de pausa: <strong>{activeBreak.break_type}</strong></p>
                                            <p className="session-start">Entrada: {new Date(activeBreak.started_at).toLocaleTimeString()}</p>
                                        </>
                                    )}

                                    <button
                                        onClick={handleEndBreak}
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Cerrando pausa...' : 'Finalizar pausa'}
                                    </button>
                                </div>
                            )}

                            {/* Mostrar pausas completadas */}
                            {activeSession?.breaks && activeSession.breaks.filter(b => b.ended_at).length > 0 && (
                                <div className="breaks-history">
                                    <h5>Pausas completadas</h5>
                                    {activeSession.breaks.filter(b => b.ended_at).map((b, index) => {
                                        const start = new Date(b.started_at);
                                        const end = new Date(b.ended_at);
                                        const diffMs = end - start;
                                        const minutes = Math.floor(diffMs / 60000);
                                        const seconds = Math.floor((diffMs % 60000) / 1000);

                                        return (
                                            <div key={b.id || index} className="break-item">
                                                <span>{b.break_type}</span>
                                                <span className="break-duration">{minutes}m {seconds}s</span>
                                                <span className="break-time">
                                                    {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={handleClockOut}
                                className="btn-clockout"
                                disabled={loading}
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? 'Fichando salida...' : 'Fichar salida'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
