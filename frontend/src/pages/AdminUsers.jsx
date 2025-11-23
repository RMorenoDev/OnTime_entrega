import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';

export default function AdminUsers() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: '', team_id: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, [search, roleFilter, teamFilter]);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (teamFilter) params.team_id = teamFilter;

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await api.get('/admin/teams');
            setTeams(response.data.teams || []);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            team_id: user.team_id || ''
        });
    };

    const handleUpdate = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.put(`/admin/users/${editingUser.id}`, formData);
            setEditingUser(null);
            fetchUsers();
            alert('User updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
            alert('User deleted successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: <span className="role-badge admin">Admin</span>,
            supervisor: <span className="role-badge supervisor">Supervisor</span>,
            employee: <span className="role-badge employee">Employee</span>
        };
        return badges[role] || role;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>⚙️ Admin Panel</h1>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>User Management</h2>
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
                        <button className="admin-nav-btn" onClick={() => navigate('/admin')}>
                            📊 Dashboard
                        </button>
                        <button className="admin-nav-btn active" onClick={() => navigate('/admin/users')}>
                            👥 Users
                        </button>
                        <button className="admin-nav-btn" onClick={() => navigate('/admin/teams')}>
                            🏢 Teams
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="admin-filters">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'supervisor', label: 'Supervisor' },
                                { value: 'employee', label: 'Employee' }
                            ]}
                            value={roleFilter}
                            onChange={(value) => setRoleFilter(value)}
                            placeholder="All Roles"
                        />
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Teams' },
                                ...teams.map(team => ({ value: team.id, label: team.name }))
                            ]}
                            value={teamFilter}
                            onChange={(value) => setTeamFilter(value)}
                            placeholder="All Teams"
                        />
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="loading">Loading users...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Team</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{getRoleBadge(u.role)}</td>
                                            <td>{u.team?.name || '—'}</td>
                                            <td>
                                                <button onClick={() => handleEdit(u)} className="table-btn edit">Edit</button>
                                                <button onClick={() => handleDelete(u.id)} className="table-btn delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Edit User</h3>
                                <button onClick={() => setEditingUser(null)} className="btn-close">✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <CustomSelect
                                        options={[
                                            { value: 'employee', label: 'Employee' },
                                            { value: 'supervisor', label: 'Supervisor' },
                                            { value: 'admin', label: 'Admin' }
                                        ]}
                                        value={formData.role}
                                        onChange={(value) => setFormData({ ...formData, role: value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Team</label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'No Team' },
                                            ...teams.map(team => ({ value: team.id, label: team.name }))
                                        ]}
                                        value={formData.team_id}
                                        onChange={(value) => setFormData({ ...formData, team_id: value })}
                                        placeholder="No Team"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setEditingUser(null)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleUpdate} className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
