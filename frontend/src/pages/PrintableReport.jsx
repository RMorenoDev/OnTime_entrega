import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import logo from '../assets/ontime_logo.png';
import api from '../api/axios';

export default function PrintableReport() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(''); // Mensajes de error
    const [reportData, setReportData] = useState(null); // Datos de reporte personal
    const [teamData, setTeamData] = useState(null); // Datos de reporte de equipo

    // Obtener parametros desde la URL
    const reportType = searchParams.get('type'); // 'personal' or 'team'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userId = searchParams.get('user_id');
    const teamId = searchParams.get('team_id');
    const userName = searchParams.get('user_name');
    const teamName = searchParams.get('team_name');

    useEffect(() => {
        fetchReportData(); // Cargar datos al montar
    }, []);

    // Recuperar datos del reporte (personal o de equipo)
    const fetchReportData = async () => {
        try {
            if (reportType === 'personal') {
                const params = { start_date: startDate, end_date: endDate };
                if (userId) params.user_id = userId;

                const response = await api.get('/reports/my-hours', { params });
                setReportData(response.data);
            } else if (reportType === 'team') {
                const params = { start_date: startDate, end_date: endDate };
                if (teamId) params.team_id = teamId;

                const response = await api.get('/reports/team-hours', { params });
                setTeamData(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch report:', err);
            setError(err.response?.data?.message || 'Error al cargar el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Formatea horas decimales a HH:MM
    const formatHoursMinutes = (decimalHours) => {
        if (!decimalHours && decimalHours !== 0) return '0:00';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    // Formatea HH:MM:SS a HH:MM
    const formatTime = (time) => {
        if (!time) return '—';
        return time.substring(0, 5);
    };

    // Fecha legible para impresion
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Traducir tipo de pausa
    const getBreakTypeLabel = (breakType) => {
        const labels = {
            coffee: '☕ Café',
            snack: '🍪 Snack',
            personal: '🙋 Personal',
            split_shift: '🍽️ Turno partido'
        };
        return labels[breakType] || breakType;
    };

    // Auto-print when data is loaded
    useEffect(() => {
        if (!loading && !error && (reportData || teamData)) {
            // Small delay to ensure rendering is complete
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, error, reportData, teamData]);

    if (loading) {
        return (
            <div className="print-page">
                <div className="print-loading">Cargando reporte...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="print-page">
                <div className="print-error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="print-page">
            {/* Encabezado del reporte */}
            <div className="print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                {/* Logo a la izquierda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={logo} alt="OnTime Logo" style={{ width: '48px', height: '48px' }} />
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>OnTime</h1>
                </div>

                {/* Info del reporte a la derecha */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <h2 style={{ margin: '0 0 0.5rem 0' }}>Reporte de horas</h2>
                    <p className="print-date-range" style={{ margin: '0.25rem 0' }}>
                        {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                    {userName && <p className="print-subtitle" style={{ margin: '0.25rem 0' }}>Empleado: {userName}</p>}
                    {teamName && <p className="print-subtitle" style={{ margin: '0.25rem 0' }}>Equipo: {teamName}</p>}
                </div>
            </div>

            {/* Reporte personal */}
            {reportType === 'personal' && reportData && (
                <div className="print-content">
                    {/* Resumen */}
                    <div className="print-summary">
                        <div className="print-summary-item">
                            <span className="label">Horas totales:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.total_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Horas netas:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.net_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Días trabajados:</span>
                            <span className="value">{reportData.summary.days_worked}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Promedio horas/día:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.avg_hours_per_day)}</span>
                        </div>
                    </div>

                    {/* Tabla de sesiones de trabajo */}
                    <h3>Sesiones de trabajo</h3>
                    <table className="print-table">
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

                    {/* Resumen de pausas */}
                    {Object.keys(reportData.break_summary).length > 0 && (
                        <>
                            <h3>Resumen de pausas</h3>
                            <table className="print-table print-table-simple">
                                <thead>
                                    <tr>
                                        <th>Tipo de pausa</th>
                                        <th>Tiempo total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reportData.break_summary).map(([type, hours]) => (
                                        <tr key={type}>
                                            <td>{getBreakTypeLabel(type)}</td>
                                            <td>{formatHoursMinutes(hours)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Reporte de equipo */}
            {reportType === 'team' && teamData && (
                <div className="print-content">
                    {/* Resumen del equipo */}
                    <div className="print-summary">
                        <div className="print-summary-item">
                            <span className="label">Horas totales del equipo:</span>
                            <span className="value">{formatHoursMinutes(teamData.team_summary.total_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Promedio por miembro:</span>
                            <span className="value">{formatHoursMinutes(teamData.team_summary.avg_hours_per_member)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Miembros activos:</span>
                            <span className="value">{teamData.team_summary.members_count}</span>
                        </div>
                    </div>

                    {/* Miembros del equipo */}
                    <h3>Miembros del equipo</h3>
                    {teamData.team_members.map(member => (
                        <div key={member.user.id} className="print-member-section">
                            <h4>{member.user.name}</h4>
                            <p className="member-email">{member.user.email}</p>
                            <p className="member-stats">
                                Total: <strong>{formatHoursMinutes(member.total_hours)}</strong> |
                                Días: {member.days_worked} |
                                Promedio: {formatHoursMinutes(member.avg_hours)}
                            </p>

                            <table className="print-table">
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
                        </div>
                    ))}
                </div>
            )}

            {/* Pie de pagina */}
            <div className="print-footer">
                <p>Generado el: {new Date().toLocaleString()}</p>
                <p>OnTime - Sistema de gestión de horas de trabajo</p>
            </div>
        </div>
    );
}
