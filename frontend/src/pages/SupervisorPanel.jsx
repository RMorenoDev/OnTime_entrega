import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SupervisorPanel({ isEmployeeView = false }) {
    const [pendingRequests, setPendingRequests] = useState([]); // Lista de solicitudes pendientes
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [error, setError] = useState(''); // Mensajes de error
    const [selectedRequest, setSelectedRequest] = useState(null); // Solicitud seleccionada
    const [rejectionReason, setRejectionReason] = useState(''); // Motivo de rechazo
    const [actionLoading, setActionLoading] = useState(false); // Estado de acciones

    // Cargar solicitudes pendientes (o de empleados) segun el modo
    const fetchPendingRequests = async () => {
        try {
            // Usar endpoint distinto segun el modo de vista
            const endpoint = isEmployeeView ? '/leave-requests/all-employees' : '/leave-requests/pending';
            const response = await api.get(endpoint);
            setPendingRequests(response.data.leave_requests);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests(); // Recargar si cambia el modo de vista
    }, [isEmployeeView]);

    // Aprobar solicitud
    const handleApprove = async (id) => {
        setActionLoading(true);
        setError('');
        try {
            await api.put(`/leave-requests/${id}/approve`);
            setPendingRequests(prev => prev.filter(req => req.id !== id));
            alert('Leave request approved successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    // Rechazar solicitud
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError('Rejection reason is required');
            return;
        }

        setActionLoading(true);
        setError('');
        try {
            await api.put(`/leave-requests/${selectedRequest.id}/reject`, {
                rejection_reason: rejectionReason
            });
            // Quitar de la lista de pendientes
            setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
            // Cerrar modal y reiniciar estado
            setSelectedRequest(null);
            setRejectionReason('');
            alert('Leave request rejected successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    // Mapea tipo de permiso a clase de badge
    const getStatusBadgeClass = (leaveType) => {
        const types = {
            vacation: 'badge-vacation',
            medical: 'badge-medical',
            personal: 'badge-personal'
        };
        return types[leaveType] || 'badge-default';
    };

    // Formatea la duracion a texto legible
    const formatDuration = (request) => {
        if (request.is_full_day) {
            const start = new Date(request.start_at);
            const end = new Date(request.end_at);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return `${days} day${days > 1 ? 's' : ''}`;
        }
        return `${request.duration_hours} hours`;
    };

    if (loading) {
        return <div className="loading">Loading pending requests...</div>;
    }

    return (
        <div className="supervisor-panel">
            <div className="panel-header">
                <h2>📋 {isEmployeeView ? 'Employee Leave Requests' : 'Pending Leave Requests'}</h2>
                <span className="pending-count">{pendingRequests.length} pending</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            {pendingRequests.length === 0 ? (
                <div className="empty-state">
                    <p>✅ No pending leave requests</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {pendingRequests.map(request => (
                        <div key={request.id} className="request-card">
                            <div className="card-header">
                                <div className="employee-info">
                                    <h3>{request.user.name}</h3>
                                    <p className="employee-email">{request.user.email}</p>
                                </div>
                                <span className={`leave-badge ${getStatusBadgeClass(request.leave_type)}`}>
                                    {request.leave_type}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="request-details">
                                    <div className="detail-item">
                                        <span className="label">📅 Period:</span>
                                        <span>{new Date(request.start_at).toLocaleDateString()}</span>
                                        {request.end_at && (
                                            <span> - {new Date(request.end_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">⏱️ Duration:</span>
                                        <span>{formatDuration(request)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">💰 Type:</span>
                                        <span>{request.is_paid ? 'Paid' : 'Unpaid'}</span>
                                    </div>
                                </div>

                                <div className="request-note">
                                    <strong>Reason:</strong>
                                    <p>{request.note}</p>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    onClick={() => handleApprove(request.id)}
                                    className="btn-approve"
                                    disabled={actionLoading}
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    onClick={() => setSelectedRequest(request)}
                                    className="btn-reject"
                                    disabled={actionLoading}
                                >
                                    ✕ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de rechazo */}
            {selectedRequest && (
                <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reject Leave Request</h3>
                            <button onClick={() => setSelectedRequest(null)} className="btn-close">✕</button>
                        </div>
                        <div className="modal-body">
                            <p>Employee: <strong>{selectedRequest.user.name}</strong></p>
                            <p>Leave Type: <strong>{selectedRequest.leave_type}</strong></p>

                            <div className="form-group">
                                <label htmlFor="rejection_reason">Rejection Reason *</label>
                                <textarea
                                    id="rejection_reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="4"
                                    placeholder="Please provide a reason for rejection..."
                                    required
                                    maxLength="1000"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn-reject"
                                disabled={actionLoading || !rejectionReason.trim()}
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
