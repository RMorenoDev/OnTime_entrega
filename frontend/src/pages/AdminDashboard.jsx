import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null); // Datos del dashboard
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(''); // Mensajes de error

    useEffect(() => {
        fetchStats(); // Carga estadisticas al montar
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats/overview');
            setStats(response.data);
        } catch (err) {
            console.error('Admin stats error:', err);
            setError(err.response?.data?.message || 'Error al obtener estadísticas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {loading ? (
                    <div className="loading">Cargando panel de admin...</div>
                ) : (
                    <>
                        <div className="dashboard-header">
                            <div>
                                <h1>⚙️ Panel de Admin</h1>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Resumen del sistema</h2>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--gray-light)', fontSize: '0.9rem' }}>
                                    {user?.name} • Admin
                                </p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => navigate('/reports')} className="btn-secondary">
                                    Reportes
                                </button>
                                <button onClick={() => navigate('/leave-requests')} className="btn-secondary">
                                    Permisos
                                </button>
                                <button onClick={() => navigate('/')} className="btn-secondary">
                                    Dashboard
                                </button>
                                <button onClick={logout} className="btn-secondary">
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="work-session-card">
                            {/* Pestañas de navegacion */}
                            <div className="admin-nav">
                                <button className="admin-nav-btn active" onClick={() => navigate('/admin')}>
                                    📊 Dashboard
                                </button>
                                <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
                                    👤 Usuarios
                                </button>
                                <button className="admin-nav-btn" onClick={() => navigate('/admin/teams')}>
                                    🧑‍🤝‍🧑 Equipos
                                </button>
                            </div>

                            {stats && (
                                <>
                                    {/* Estadisticas de usuarios */}
                                    <div className="stats-section">
                                        <h3>👤 Usuarios</h3>
                                        <div className="stats-grid">
                                            <div className="stat-card total">
                                                <div className="stat-value">{stats.users.total}</div>
                                                <div className="stat-label">Usuarios totales</div>
                                            </div>
                                            <div className="stat-card admin">
                                                <div className="stat-value">{stats.users.admins}</div>
                                                <div className="stat-label">Admins</div>
                                            </div>
                                            <div className="stat-card supervisor">
                                                <div className="stat-value">{stats.users.supervisors}</div>
                                                <div className="stat-label">Supervisores</div>
                                            </div>
                                            <div className="stat-card employee">
                                                <div className="stat-value">{stats.users.employees}</div>
                                                <div className="stat-label">Empleados</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Equipos y sesiones */}
                                    <div className="stats-grid-2col">
                                        <div className="stats-section">
                                            <h3>🧑‍🤝‍🧑 Equipos</h3>
                                            <div className="stat-card-large">
                                                <div className="stat-value">{stats.teams.total}</div>
                                                <div className="stat-label">Equipos totales</div>
                                            </div>
                                        </div>

                                        <div className="stats-section">
                                            <h3>⏱️ Sesiones de trabajo</h3>
                                            <div className="stats-grid-mini">
                                                <div className="stat-card-small">
                                                    <div className="stat-value">{stats.work_sessions.active}</div>
                                                    <div className="stat-label">Activas ahora</div>
                                                </div>
                                                <div className="stat-card-small">
                                                    <div className="stat-value">{stats.work_sessions.today}</div>
                                                    <div className="stat-label">Hoy</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solicitudes de permiso */}
                                    <div className="stats-section">
                                        <h3>📝 Permisos</h3>
                                        <div className="stats-grid-mini">
                                            <div className="stat-card-small pending">
                                                <div className="stat-value">{stats.leave_requests.pending}</div>
                                                <div className="stat-label">Pendientes</div>
                                            </div>
                                            <div className="stat-card-small approved">
                                                <div className="stat-value">{stats.leave_requests.approved_this_month}</div>
                                                <div className="stat-label">Aprobadas este mes</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones rapidas */}
                                    <div className="quick-actions">
                                        <h3>⚡ Acciones rápidas</h3>
                                        <div className="action-buttons">
                                            <button className="action-btn" onClick={() => navigate('/admin/users')}>
                                                👤 Gestionar usuarios
                                            </button>
                                            <button className="action-btn" onClick={() => navigate('/admin/teams')}>
                                                🧑‍🤝‍🧑 Gestionar equipos
                                            </button>
                                            <button className="action-btn" onClick={() => navigate('/leave-requests')}>
                                                📝 Revisar permisos
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
