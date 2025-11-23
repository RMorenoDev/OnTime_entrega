import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import logo from '../assets/ontime_logo.png';
import CustomSelect from '../components/CustomSelect';

export default function Reports() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Estado de carga
    const [error, setError] = useState(''); // Mensaje de error
    const [activeView, setActiveView] = useState(user?.role === 'admin' ? 'employees' : 'my-hours'); // Vista actual

    // Rango de fechas: mes actual por defecto
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]); // Fecha inicio
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]); // Fecha fin

    // Datos de reportes
    const [reportData, setReportData] = useState(null); // Datos de reporte personal
    const [teamData, setTeamData] = useState(null); // Datos de reporte de equipo

    // Selectores para admin
    const [teams, setTeams] = useState([]); // Equipos para selects
    const [users, setUsers] = useState([]); // Usuarios para selects
    const [selectedTeam, setSelectedTeam] = useState(''); // Equipo escogido
    const [selectedUser, setSelectedUser] = useState(''); // Usuario escogido

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTeamsAndUsers(); // Solo admins cargan listas completas
        }
    }, [user]);

    useEffect(() => {
        fetchReport(); // Refrescar reporte ante cambios de filtro/vista
    }, [activeView, startDate, endDate, selectedTeam, selectedUser]);

    // Carga equipos y usuarios para selects de admin
    const fetchTeamsAndUsers = async () => {
        try {
            const [teamsRes, usersRes] = await Promise.all([
                api.get('/admin/teams'),
                api.get('/admin/users')
            ]);
            setTeams(Array.isArray(teamsRes.data?.teams) ? teamsRes.data.teams : (Array.isArray(teamsRes.data) ? teamsRes.data : []));
            const usersData = usersRes.data?.data || usersRes.data;
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err) {
            console.error('Failed to fetch teams/users:', err);
            setTeams([]);
            setUsers([]);
        }
    };

    // Obtener datos de reporte segun vista activa
    const fetchReport = async () => {
        if (!startDate || !endDate) return;

        // Para vista de empleados, requerir seleccion de usuario
        if (activeView === 'employees' && !selectedUser) {
            setReportData(null);
            return;
        }

        // Para horas de equipo, requerir seleccion de equipo si es admin
        if (activeView === 'team-hours' && user?.role === 'admin' && !selectedTeam) {
            setTeamData(null);
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (activeView === 'my-hours' || activeView === 'employees') {
                const params = { start_date: startDate, end_date: endDate };
                if (selectedUser) {
                    params.user_id = selectedUser;
                }
                const response = await api.get('/reports/my-hours', { params });
                setReportData(response.data);
            } else {
                const params = { start_date: startDate, end_date: endDate };
                if (selectedTeam) {
                    params.team_id = selectedTeam;
                }
                const response = await api.get('/reports/team-hours', { params });
                setTeamData(response.data);
            }
        } catch (err) {
            console.error('Report fetch error:', err);
            setError(err.response?.data?.message || 'Error al obtener el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Convertir horas decimales a formato HH:MM
    const formatHoursMinutes = (decimalHours) => {
        if (!decimalHours && decimalHours !== 0) return '0:00';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const formatTime = (time) => {
        if (!time) return '—';
        return time.substring(0, 5); // HH:MM
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openPrintView = () => {
        // Construir URL con parametros de consulta
        const params = new URLSearchParams();
        params.append('start_date', startDate);
        params.append('end_date', endDate);

        if (activeView === 'employees') {
            params.append('type', 'personal');
            if (selectedUser) {
                params.append('user_id', selectedUser);
                // Buscar nombre del usuario
                const userRow = users.find(u => u.id === parseInt(selectedUser));
                if (userRow) params.append('user_name', userRow.name);
            }
        } else if (activeView === 'team-hours') {
            params.append('type', 'team');
            if (selectedTeam) {
                params.append('team_id', selectedTeam);
                // Buscar nombre del equipo
                const team = teams.find(t => t.id === parseInt(selectedTeam));
                if (team) params.append('team_name', team.name);
            }
        } else {
            params.append('type', 'personal');
            params.append('user_name', user?.name || 'Mis horas');
        }
        
        // Abrir en nueva ventana
        const printUrl = `/reports/print?${params.toString()}`;
        window.open(printUrl, '_blank', 'width=1200,height=800');
    };

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
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Reportes de horas</h2>
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

                <div className="work-session-card">
                    {/* Cambio de vista para supervisores */}
                    {(user?.role === 'supervisor' || user?.role === 'admin') && (
                        <div className="view-toggle">
                            {user?.role === 'admin' ? (
                                <>
                                    <button
                                        className={`toggle-btn ${activeView === 'employees' ? 'active' : ''}`}
                                        onClick={() => setActiveView('employees')}
                                    >
                                        Empleados
                                    </button>
                                    <button
                                        className={`toggle-btn ${activeView === 'team-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('team-hours')}
                                    >
                                        Horas por equipo
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className={`toggle-btn ${activeView === 'my-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('my-hours')}
                                    >
                                        Mis horas
                                    </button>
                                    <button
                                        className={`toggle-btn ${activeView === 'team-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('team-hours')}
                                    >
                                        Horas del equipo
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Selector de rango de fechas */}
                    <div className="date-range-picker">
                        <div className="date-input-group">
                            <label>Fecha inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                        </div>
                        <div className="date-input-group">
                            <label>Fecha fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={today.toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Selectores para admin */}
                        {user?.role === 'admin' && activeView === 'employees' && (
                            <div className="date-input-group">
                                <label>Selecciona empleado</label>
                                <CustomSelect
                                    options={[
                                        { value: '', label: '-- Selecciona un empleado --' },
                                        ...users.map(u => ({ value: u.id, label: u.name }))
                                    ]}
                                    value={selectedUser}
                                    onChange={(value) => setSelectedUser(value)}
                                    placeholder="-- Selecciona un empleado --"
                                />
                            </div>
                        )}

                        {user?.role === 'admin' && activeView === 'team-hours' && (
                            <div className="date-input-group">
                                <label>Selecciona equipo</label>
                                <CustomSelect
                                    options={[
                                        { value: '', label: '-- Selecciona un equipo --' },
                                        ...teams.map(t => ({ value: t.id, label: t.name }))
                                    ]}
                                    value={selectedTeam}
                                    onChange={(value) => setSelectedTeam(value)}
                                    placeholder="-- Selecciona un equipo --"
                                />
                            </div>
                        )}


                        <button
                            onClick={openPrintView}
                            className="btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            disabled={
                                (activeView === 'employees' && !selectedUser) ||
                                (activeView === 'team-hours' && user?.role === 'admin' && !selectedTeam)
                            }
                        >
                            📄 Generar reporte
                        </button>

                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="loading">Cargando reporte...</div>
                    ) : (activeView === 'my-hours' || activeView === 'employees') && reportData ? (
                        <>
                            {/* Tarjetas de resumen */}
                            <div className="report-summary">
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.total_hours)}</div>
                                    <div className="summary-label">Horas totales</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.net_hours)}</div>
                                    <div className="summary-label">Horas netas (total - pausas)</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{reportData.summary.days_worked}</div>
                                    <div className="summary-label">Días trabajados</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.avg_hours_per_day)}</div>
                                    <div className="summary-label">Promedio horas/día</div>
                                </div>
                            </div>

                            {/* Resumen de pausas */}
                            {Object.keys(reportData.break_summary).length > 0 && (
                                <div className="break-summary-section">
                                    <h3>Resumen de pausas</h3>
                                    <div className="break-summary-grid">
                                        {Object.entries(reportData.break_summary).map(([type, hours]) => (
                                            <div key={type} className="break-summary-item">
                                                <span className="break-type">{type}</span>
                                                <span className="break-hours">{formatHoursMinutes(hours)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tabla de sesiones de trabajo */}
                            <div className="report-table-container">
                                <h3>Sesiones de trabajo</h3>
                                {reportData.sessions.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>
                                        No se encontraron sesiones en este periodo
                                    </p>
                                ) : (
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Entrada</th>
                                                <th>Salida</th>
                                                <th>Horas</th>
                                                <th>Pausas</th>
                                                <th>Horas netas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.sessions.map(session => (
                                                <tr key={session.id}>
                                                    <td>{formatDate(session.date)}</td>
                                                    <td>{formatTime(session.clock_in)}</td>
                                                    <td>{formatTime(session.clock_out)}</td>
                                                    <td>{formatHoursMinutes(session.total_hours)}</td>
                                                    <td>{formatHoursMinutes(session.break_time)}</td>
                                                    <td><strong>{formatHoursMinutes(session.net_hours)}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    ) : activeView === 'team-hours' && teamData ? (
                        <>
                            {/* Cabecera con nombre de equipo */}
                            {teamData.team && (
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--white)', margin: 0 }}>🧑‍🤝‍🧑 {teamData.team.name}</h3>
                                </div>
                            )}

                            {/* Resumen del equipo */}
                            <div className="report-summary">
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(teamData.team_summary.total_hours)}</div>
                                    <div className="summary-label">Horas totales del equipo</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(teamData.team_summary.avg_hours_per_member)}</div>
                                    <div className="summary-label">Promedio por miembro</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{teamData.team_summary.members_count}</div>
                                    <div className="summary-label">Miembros activos</div>
                                </div>
                            </div>

                            {/* Lista de miembros del equipo */}
                            <div className="team-hours-container">
                                <h3>Horas por miembro</h3>
                                {teamData.team_members.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>
                                        No hay sesiones de trabajo en este periodo
                                    </p>
                                ) : (
                                    teamData.team_members.map(member => (
                                        <div key={member.user.id} className="team-member-report">
                                            <div className="member-header">
                                                <div>
                                                    <h4>{member.user.name}</h4>
                                                    <p className="member-email">{member.user.email}</p>
                                                </div>
                                                <div className="member-stats">
                                                    <span><strong>{formatHoursMinutes(member.total_hours)}</strong> total</span>
                                                    <span>{member.days_worked} días</span>
                                                    <span>{formatHoursMinutes(member.avg_hours)} promedio</span>
                                                </div>
                                            </div>
                                            <details className="session-details">
                                                <summary>Ver sesiones ({member.sessions.length})</summary>
                                                <table className="report-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Fecha</th>
                                                            <th>Entrada</th>
                                                            <th>Salida</th>
                                                            <th>Horas totales</th>
                                                            <th>Horas netas</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {member.sessions.map(session => (
                                                            <tr key={session.id}>
                                                                <td>{formatDate(session.date)}</td>
                                                                <td>{formatTime(session.clock_in)}</td>
                                                                <td>{formatTime(session.clock_out)}</td>
                                                                <td>{formatHoursMinutes(session.total_hours)}</td>
                                                                <td><strong>{formatHoursMinutes(session.net_hours)}</strong></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </details>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : !loading && (
                        <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>
                            {activeView === 'employees'
                                ? 'Selecciona un empleado y pulsa "Generar reporte"'
                                : activeView === 'team-hours'
                                    ? 'Selecciona un equipo y pulsa "Generar reporte"'
                                    : 'Selecciona un rango de fechas y pulsa "Generar reporte"'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
