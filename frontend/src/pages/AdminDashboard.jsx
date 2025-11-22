import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats/overview');
            setStats(response.data);
        } catch (err) {
            console.error('Admin stats error:', err);
            setError(err.response?.data?.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {loading ? (
                    <div className="loading">Loading admin dashboard...</div>
                ) : (
                    <>
                        <div className="dashboard-header">
                            <div>
                                <h1>⚙️ Admin Panel</h1>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>System Overview</h2>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--gray-light)', fontSize: '0.9rem' }}>
                                    {user?.name} • Admin
                                </p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => navigate('/reports')} className="btn-secondary">
                                    Reports
                                </button>
                                <button onClick={() => navigate('/leave-requests')} className="btn-secondary">
                                    Leave Requests
                                </button>
                                <button onClick={() => navigate('/')} className="btn-secondary">
                                    Dashboard
                                </button>
                                <button onClick={logout} className="btn-secondary">
                                    Logout
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="work-session-card">
                            {/* Navigation Tabs */}
                            <div className="admin-nav">
                                <button className="admin-nav-btn active" onClick={() => navigate('/admin')}>
                                    📊 Dashboard
                                </button>
                                <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
                                    👥 Users
                                </button>
                                <button className="admin-nav-btn" onClick={() => navigate('/admin/teams')}>
                                    🏢 Teams
                                </button>
                            </div>

                            {stats && (
                                <>
                                    {/* Users Statistics */}
                                    <div className="stats-section">
                                        <h3>👥 Users</h3>
                                        <div className="stats-grid">
                                            <div className="stat-card total">
                                                <div className="stat-value">{stats.users.total}</div>
                                                <div className="stat-label">Total Users</div>
                                            </div>
                                            <div className="stat-card admin">
                                                <div className="stat-value">{stats.users.admins}</div>
                                                <div className="stat-label">Admins</div>
                                            </div>
                                            <div className="stat-card supervisor">
                                                <div className="stat-value">{stats.users.supervisors}</div>
                                                <div className="stat-label">Supervisors</div>
                                            </div>
                                            <div className="stat-card employee">
                                                <div className="stat-value">{stats.users.employees}</div>
                                                <div className="stat-label">Employees</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teams & Work Sessions */}
                                    <div className="stats-grid-2col">
                                        <div className="stats-section">
                                            <h3>🏢 Teams</h3>
                                            <div className="stat-card-large">
                                                <div className="stat-value">{stats.teams.total}</div>
                                                <div className="stat-label">Total Teams</div>
                                            </div>
                                        </div>

                                        <div className="stats-section">
                                            <h3>⏱️ Work Sessions</h3>
                                            <div className="stats-grid-mini">
                                                <div className="stat-card-small">
                                                    <div className="stat-value">{stats.work_sessions.active}</div>
                                                    <div className="stat-label">Active Now</div>
                                                </div>
                                                <div className="stat-card-small">
                                                    <div className="stat-value">{stats.work_sessions.today}</div>
                                                    <div className="stat-label">Today</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leave Requests */}
                                    <div className="stats-section">
                                        <h3>📝 Leave Requests</h3>
                                        <div className="stats-grid-mini">
                                            <div className="stat-card-small pending">
                                                <div className="stat-value">{stats.leave_requests.pending}</div>
                                                <div className="stat-label">Pending</div>
                                            </div>
                                            <div className="stat-card-small approved">
                                                <div className="stat-value">{stats.leave_requests.approved_this_month}</div>
                                                <div className="stat-label">Approved This Month</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="quick-actions">
                                        <h3>⚡ Quick Actions</h3>
                                        <div className="action-buttons">
                                            <button className="action-btn" onClick={() => navigate('/admin/users')}>
                                                👤 Manage Users
                                            </button>
                                            <button className="action-btn" onClick={() => navigate('/admin/teams')}>
                                                🏢 Manage Teams
                                            </button>
                                            <button className="action-btn" onClick={() => navigate('/leave-requests')}>
                                                📋 Review Leave Requests
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
