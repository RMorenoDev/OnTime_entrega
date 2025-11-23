import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import logo from '../assets/ontime_logo.png';
import LeaveRequestForm from '../components/LeaveRequestForm';
import SupervisorPanel from './SupervisorPanel';

export default function LeaveRequests() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [myRequests, setMyRequests] = useState([]); // Mis solicitudes
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(''); // Errores en UI
    const [showForm, setShowForm] = useState(false); // Mostrar formulario
    const [filter, setFilter] = useState('all'); // Filtro de estado
    // Vista por defecto: 'supervisor' para admins, 'my-requests' para otros
    const [activeView, setActiveView] = useState(user?.role === 'admin' ? 'supervisor' : 'my-requests');

    // Obtener solicitudes propias
    const fetchMyRequests = async () => {
        try {
            const response = await api.get('/leave-requests');
            setMyRequests(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeView === 'my-requests') {
            fetchMyRequests(); // Cargar solo cuando se esta en vista personal
        }
    }, [activeView]);

    // Cancelar solicitud
    const handleCancel = async (id) => {
        if (!confirm('¿Seguro que deseas cancelar esta solicitud?')) return;

        try {
            await api.put(`/leave-requests/${id}/cancel`);
            fetchMyRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cancelar solicitud');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: <span className="status-badge badge-pending">⏳ Pendiente</span>,
            approved: <span className="status-badge badge-approved">✅ Aprobada</span>,
            rejected: <span className="status-badge badge-rejected">❌ Rechazada</span>,
            cancelled: <span className="status-badge badge-cancelled">🚫 Cancelada</span>
        };
        return badges[status] || status;
    };

    const getLeaveTypeBadge = (type) => {
        const badges = {
            vacation: '🌴 Vacaciones',
            medical: '🏖️ Médica',
            personal: '🙋 Personal'
        };
        return badges[type] || type;
    };

    const formatDuration = (request) => {
        if (request.is_full_day) {
            const start = new Date(request.start_at);
            const end = new Date(request.end_at);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return `${days} día${days > 1 ? 's' : ''}`;
        }
        return `${request.duration_hours} horas`;
    };

    const filteredRequests = filter === 'all'
        ? myRequests
        : myRequests.filter(req => req.status === filter);

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
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Solicitudes de permiso</h2>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--gray-light)', fontSize: '0.9rem' }}>
                            {user?.name} • {user?.role}
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
                        <button onClick={() => navigate('/')} className="btn-secondary">
                            Dashboard
                        </button>
                        <button onClick={logout} className="btn-secondary">
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* Tarjeta principal de contenido */}
                <div className="work-session-card">
                    {/* Cambio de vista segun rol (admin vs supervisor) */}
                    {user?.role === 'admin' ? (
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${activeView === 'supervisor' ? 'active' : ''}`}
                                onClick={() => setActiveView('supervisor')}
                            >
                                Solicitudes de supervisores
                            </button>
                            <button
                                className={`toggle-btn ${activeView === 'employees' ? 'active' : ''}`}
                                onClick={() => setActiveView('employees')}
                            >
                                Solicitudes de empleados
                            </button>
                        </div>
                    ) : user?.role === 'supervisor' ? (
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${activeView === 'my-requests' ? 'active' : ''}`}
                                onClick={() => setActiveView('my-requests')}
                            >
                                Mis solicitudes
                            </button>
                            <button
                                className={`toggle-btn ${activeView === 'supervisor' ? 'active' : ''}`}
                                onClick={() => setActiveView('supervisor')}
                            >
                                Solicitudes del equipo
                            </button>
                        </div>
                    ) : null}

                    {/* Vistas para admin/supervisor */}
                    {user?.role === 'admin' && activeView === 'supervisor' ? (
                        <SupervisorPanel />
                    ) : user?.role === 'admin' && activeView === 'employees' ? (
                        <SupervisorPanel isEmployeeView={true} />
                    ) : (user?.role === 'supervisor' && activeView === 'supervisor') ? (
                        <SupervisorPanel />
                    ) : (
                        <>
                            {showForm ? (
                                <LeaveRequestForm
                                    onSuccess={() => {
                                        setShowForm(false);
                                        fetchMyRequests();
                                    }}
                                    onCancel={() => setShowForm(false)}
                                />
                            ) : (
                                <>
                                    <div className="leave-actions">
                                        <button onClick={() => setShowForm(true)} className="btn-primary">
                                            + Nueva solicitud
                                        </button>
                                    </div>

                                    <div className="leave-filters">
                                        <button
                                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                            onClick={() => setFilter('all')}
                                        >
                                            Todas
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                            onClick={() => setFilter('pending')}
                                        >
                                            Pendientes
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                                            onClick={() => setFilter('approved')}
                                        >
                                            Aprobadas
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                                            onClick={() => setFilter('rejected')}
                                        >
                                            Rechazadas
                                        </button>
                                    </div>

                                    {error && <div className="error-message">{error}</div>}

                                    {loading ? (
                                        <div className="loading">Cargando...</div>
                                    ) : filteredRequests.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-light)' }}>
                                            <p>No hay solicitudes</p>
                                        </div>
                                    ) : (
                                        <div className="leave-requests-list">
                                            {filteredRequests.map(request => (
                                                <div key={request.id} className="leave-request-card">
                                                    <div className="card-header">
                                                        <span className="leave-type">{getLeaveTypeBadge(request.leave_type)}</span>
                                                        {getStatusBadge(request.status)}
                                                    </div>

                                                    <div className="card-body">
                                                        <div className="request-info">
                                                            <p><strong>Periodo:</strong> {new Date(request.start_at).toLocaleDateString()}
                                                                {request.end_at && ` - ${new Date(request.end_at).toLocaleDateString()}`}</p>
                                                            <p><strong>Duración:</strong> {formatDuration(request)}</p>
                                                            <p><strong>Tipo:</strong> {request.is_paid ? 'Pagado' : 'No pagado'}</p>
                                                        </div>

                                                        <div className="request-note">
                                                            <strong>Motivo:</strong>
                                                            <p>{request.note}</p>
                                                        </div>

                                                        {request.rejection_reason && (
                                                            <div className="rejection-reason">
                                                                <strong>Motivo de rechazo:</strong>
                                                                <p>{request.rejection_reason}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {(request.status === 'pending' || request.status === 'approved') && (
                                                        <div className="card-actions">
                                                            <button
                                                                onClick={() => handleCancel(request.id)}
                                                                className="btn-cancel"
                                                            >
                                                                Cancelar solicitud
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
