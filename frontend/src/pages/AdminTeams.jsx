import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';

export default function AdminTeams() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]); // Listado de equipos
    const [users, setUsers] = useState([]); // Usuarios para asignar supervisor
    const [loading, setLoading] = useState(true); // Carga inicial
    const [error, setError] = useState(''); // Errores de UI
    const [editingTeam, setEditingTeam] = useState(null); // Equipo en edicion
    const [creatingTeam, setCreatingTeam] = useState(false); // Modal de creacion
    const [formData, setFormData] = useState({ name: '', supervisor_user_id: '' }); // Formulario basico
    const [actionLoading, setActionLoading] = useState(false); // Estado de acciones CRUD
    const [viewingMembers, setViewingMembers] = useState(null); // Equipo seleccionado para ver miembros
    const [members, setMembers] = useState([]); // Miembros cargados

    useEffect(() => {
        fetchTeams(); // Cargar equipos
        fetchUsers(); // Cargar usuarios para dropdowns
    }, []);

    // Obtener equipos desde la API
    const fetchTeams = async () => {
        try {
            const response = await api.get('/admin/teams');
            setTeams(response.data.teams || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener equipos');
        } finally {
            setLoading(false);
        }
    };

    // Obtener usuarios para dropdown de supervisor
    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    // Crear nuevo equipo
    const handleCreate = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.post('/admin/teams', formData);
            setCreatingTeam(false);
            setFormData({ name: '', supervisor_user_id: '' });
            fetchTeams();
            alert('Equipo creado con éxito');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear equipo');
        } finally {
            setActionLoading(false);
        }
    };

    // Actualizar equipo existente
    const handleUpdate = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.put(`/admin/teams/${editingTeam.id}`, formData);
            setEditingTeam(null);
            setFormData({ name: '', supervisor_user_id: '' });
            fetchTeams();
            alert('Equipo actualizado con éxito');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar equipo');
        } finally {
            setActionLoading(false);
        }
    };

    // Eliminar equipo (sin miembros)
    const handleDelete = async (teamId) => {
        if (!confirm('¿Seguro que deseas eliminar este equipo? Debe estar sin miembros.')) return;

        setActionLoading(true);
        try {
            await api.delete(`/admin/teams/${teamId}`);
            fetchTeams();
            alert('Equipo eliminado con éxito');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar equipo');
        } finally {
            setActionLoading(false);
        }
    };

    // Ver miembros del equipo seleccionado
    const handleViewMembers = async (team) => {
        try {
            const response = await api.get(`/admin/teams/${team.id}/members`);
            setMembers(response.data.members || []);
            setViewingMembers(team);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener miembros');
        }
    };

    const supervisors = users.filter(u => u.role === 'supervisor' || u.role === 'admin'); // Opciones validas para supervisor

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>⚙️ Panel de Admin</h1>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Gestión de equipos</h2>
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
                        <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
                            👤 Usuarios
                        </button>
                        <button className="admin-nav-btn active" onClick={() => navigate('/admin/teams')}>
                            🧑‍🤝‍🧑 Equipos
                        </button>
                    </div>

                    <div className="leave-actions">
                        <button onClick={() => setCreatingTeam(true)} className="btn-primary">
                            + Crear equipo
                        </button>
                    </div>

                    {/* Grid de equipos */}
                    {loading ? (
                        <div className="loading">Cargando equipos...</div>
                    ) : (
                        <div className="teams-grid">
                            {teams.map(team => (
                                <div key={team.id} className="team-card">
                                    <div className="team-header">
                                        <h3>{team.name}</h3>
                                        <span className="member-count">{team.members_count} miembros</span>
                                    </div>
                                    <div className="team-body">
                                        <p><strong>Supervisor:</strong> {team.supervisor?.name || 'Sin asignar'}</p>
                                    </div>
                                    <div className="team-actions">
                                        <button onClick={() => handleViewMembers(team)} className="table-btn view">
                                            Ver miembros
                                        </button>
                                        <button onClick={() => {
                                            setEditingTeam(team);
                                            setFormData({ name: team.name, supervisor_user_id: team.supervisor_user_id || '' });
                                        }} className="table-btn edit">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(team.id)} className="table-btn delete">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal crear equipo */}
                {creatingTeam && (
                    <div className="modal-overlay" onClick={() => setCreatingTeam(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Crear equipo</h3>
                                <button onClick={() => setCreatingTeam(false)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nombre del equipo *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ingresa el nombre"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Asignar supervisor</label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Sin supervisor' },
                                            ...supervisors.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
                                        ]}
                                        value={formData.supervisor_user_id}
                                        onChange={(value) => setFormData({ ...formData, supervisor_user_id: value })}
                                        placeholder="Sin supervisor"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setCreatingTeam(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button onClick={handleCreate} className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Creando...' : 'Crear equipo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal editar equipo */}
                {editingTeam && (
                    <div className="modal-overlay" onClick={() => setEditingTeam(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Editar equipo</h3>
                                <button onClick={() => setEditingTeam(null)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nombre del equipo *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Asignar supervisor</label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Sin supervisor' },
                                            ...supervisors.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
                                        ]}
                                        value={formData.supervisor_user_id}
                                        onChange={(value) => setFormData({ ...formData, supervisor_user_id: value })}
                                        placeholder="Sin supervisor"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setEditingTeam(null)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button onClick={handleUpdate} className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal ver miembros */}
                {viewingMembers && (
                    <div className="modal-overlay" onClick={() => setViewingMembers(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Miembros del equipo: {viewingMembers.name}</h3>
                                <button onClick={() => setViewingMembers(null)} className="btn-close">×</button>
                            </div>
                            <div className="modal-body">
                                {members.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray-light)' }}>No hay miembros en este equipo</p>
                                ) : (
                                    <ul className="members-list">
                                        {members.map(member => (
                                            <li key={member.id}>
                                                <strong>{member.name}</strong> • {member.email} • {member.role}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setViewingMembers(null)} className="btn-secondary">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
