import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';

export default function AdminUsers() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); // Lista de usuarios
    const [teams, setTeams] = useState([]); // Equipos para filtros y asignaciones
    const [loading, setLoading] = useState(true); // Cargando tabla
    const [error, setError] = useState(''); // Mensaje de error
    const [search, setSearch] = useState(''); // Filtro texto
    const [roleFilter, setRoleFilter] = useState(''); // Filtro por rol
    const [teamFilter, setTeamFilter] = useState(''); // Filtro por equipo
    const [editingUser, setEditingUser] = useState(null); // Usuario en edicion
    const [formData, setFormData] = useState({ name: '', email: '', role: '', team_id: '' }); // Datos del modal
    const [actionLoading, setActionLoading] = useState(false); // Estado de acciones CRUD

    useEffect(() => {
        fetchUsers(); // Cargar usuarios con filtros
        fetchTeams(); // Cargar equipos para selects
    }, [search, roleFilter, teamFilter]);

    // Obtener usuarios con filtros aplicados
    const fetchUsers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (teamFilter) params.team_id = teamFilter;

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener usuarios');
        } finally {
            setLoading(false);
        }
    };

    // Obtener equipos para filtros y asignaciones
    const fetchTeams = async () => {
        try {
            const response = await api.get('/admin/teams');
            setTeams(response.data.teams || []);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        }
    };

    // Prepara el modal de edicion
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            team_id: user.team_id || ''
        });
    };

    // Guardar cambios del usuario
    const handleUpdate = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.put(`/admin/users/${editingUser.id}`, formData);
            setEditingUser(null);
            fetchUsers();
            alert('Usuario actualizado con éxito');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar usuario');
        } finally {
            setActionLoading(false);
        }
    };

    // Eliminar usuario
    const handleDelete = async (userId) => {
        if (!confirm('¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;

        setActionLoading(true);
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
            alert('Usuario eliminado con éxito');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar usuario');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: <span className="role-badge admin">Admin</span>,
            supervisor: <span className="role-badge supervisor">Supervisor</span>,
            employee: <span className="role-badge employee">Empleado</span>
        };
        return badges[role] || role;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>⚙️ Panel de Admin</h1>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Gestión de usuarios</h2>
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
                        <button className="admin-nav-btn" onClick={() => navigate('/admin')}>
                            📊 Dashboard
                        </button>
                        <button className="admin-nav-btn active" onClick={() => navigate('/admin/users')}>
                            👤 Usuarios
                        </button>
                        <button className="admin-nav-btn" onClick={() => navigate('/admin/teams')}>
                            🧑‍🤝‍🧑 Equipos
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="admin-filters">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <CustomSelect
                            options={[
                                { value: '', label: 'Todos los roles' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'supervisor', label: 'Supervisor' },
                                { value: 'employee', label: 'Empleado' }
                            ]}
                            value={roleFilter}
                            onChange={(value) => setRoleFilter(value)}
                            placeholder="Todos los roles"
                        />
                        <CustomSelect
                            options={[
                                { value: '', label: 'Todos los equipos' },
                                ...teams.map(team => ({ value: team.id, label: team.name }))
                            ]}
                            value={teamFilter}
                            onChange={(value) => setTeamFilter(value)}
                            placeholder="Todos los equipos"
                        />
                    </div>

                    {/* Tabla de usuarios */}
                    {loading ? (
                        <div className="loading">Cargando usuarios...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Equipo</th>
                                        <th>Acciones</th>
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
                                                <button onClick={() => handleEdit(u)} className="table-btn edit">Editar</button>
                                                <button onClick={() => handleDelete(u.id)} className="table-btn delete">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal editar usuario */}
                {editingUser && (
                    <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Editar usuario</h3>
                                <button onClick={() => setEditingUser(null)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nombre</label>
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
                                    <label>Rol</label>
                                    <CustomSelect
                                        options={[
                                            { value: 'employee', label: 'Empleado' },
                                            { value: 'supervisor', label: 'Supervisor' },
                                            { value: 'admin', label: 'Admin' }
                                        ]}
                                        value={formData.role}
                                        onChange={(value) => setFormData({ ...formData, role: value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Equipo</label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Sin equipo' },
                                            ...teams.map(team => ({ value: team.id, label: team.name }))
                                        ]}
                                        value={formData.team_id}
                                        onChange={(value) => setFormData({ ...formData, team_id: value })}
                                        placeholder="Sin equipo"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setEditingUser(null)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button onClick={handleUpdate} className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
