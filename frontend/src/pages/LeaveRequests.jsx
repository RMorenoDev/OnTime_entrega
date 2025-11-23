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
            setError(err.response?.data?.message || 'Failed to fetch leave requests');
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
        if (!confirm('Are you sure you want to cancel this leave request?')) return;

        try {
            await api.put(`/leave-requests/${id}/cancel`);
            fetchMyRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel request');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: <span className="status-badge badge-pending">⏳ Pending</span>,
            approved: <span className="status-badge badge-approved">✓ Approved</span>,
            rejected: <span className="status-badge badge-rejected">✕ Rejected</span>,
            cancelled: <span className="status-badge badge-cancelled">⊗ Cancelled</span>
        };
        return badges[status] || status;
    };

    const getLeaveTypeBadge = (type) => {
        const badges = {
            vacation: '🏖️ Vacation',
            medical: '🏥 Medical',
            personal: '🚶 Personal'
        };
        return badges[type] || type;
    };

    const formatDuration = (request) => {
        if (request.is_full_day) {
            const start = new Date(request.start_at);
            const end = new Date(request.end_at);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return `${days} day${days > 1 ? 's' : ''}`;
        }
        return `${request.duration_hours} hours`;
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
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Leave Requests</h2>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--gray-light)', fontSize: '0.9rem' }}>
                            {user?.name} • {user?.role}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem' }}>
                        {user?.role === 'admin' && (
                            <button onClick={() => navigate('/admin')} className="btn-secondary">
                                Admin Panel
                            </button>
                        )}
                        <button onClick={() => navigate('/reports')} className="btn-secondary">
                            Reports
                        </button>
                        <button onClick={() => navigate('/')} className="btn-secondary">
                            Dashboard
                        </button>
                        <button onClick={logout} className="btn-secondary">
                            Logout
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
                                Supervisor Requests
                            </button>
                            <button
                                className={`toggle-btn ${activeView === 'employees' ? 'active' : ''}`}
                                onClick={() => setActiveView('employees')}
                            >
                                Employee Requests
                            </button>
                        </div>
                    ) : user?.role === 'supervisor' ? (
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${activeView === 'my-requests' ? 'active' : ''}`}
                                onClick={() => setActiveView('my-requests')}
                            >
                                My Requests
                            </button>
                            <button
                                className={`toggle-btn ${activeView === 'supervisor' ? 'active' : ''}`}
                                onClick={() => setActiveView('supervisor')}
                            >
                                Team Requests
                            </button>
                        </div>
                    ) : null}

                    {/* Vistas para admin */}
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
                                            + New Leave Request
                                        </button>
                                    </div>

                                    <div className="leave-filters">
                                        <button
                                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                            onClick={() => setFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                            onClick={() => setFilter('pending')}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                                            onClick={() => setFilter('approved')}
                                        >
                                            Approved
                                        </button>
                                        <button
                                            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                                            onClick={() => setFilter('rejected')}
                                        >
                                            Rejected
                                        </button>
                                    </div>

                                    {error && <div className="error-message">{error}</div>}

                                    {loading ? (
                                        <div className="loading">Loading...</div>
                                    ) : filteredRequests.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-light)' }}>
                                            <p>No leave requests found</p>
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
                                                            <p><strong>Period:</strong> {new Date(request.start_at).toLocaleDateString()}
                                                                {request.end_at && ` - ${new Date(request.end_at).toLocaleDateString()}`}</p>
                                                            <p><strong>Duration:</strong> {formatDuration(request)}</p>
                                                            <p><strong>Type:</strong> {request.is_paid ? 'Paid' : 'Unpaid'}</p>
                                                        </div>

                                                        <div className="request-note">
                                                            <strong>Reason:</strong>
                                                            <p>{request.note}</p>
                                                        </div>

                                                        {request.rejection_reason && (
                                                            <div className="rejection-reason">
                                                                <strong>Rejection Reason:</strong>
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
                                                                Cancel Request
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
