import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function Reports() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState(user?.role === 'admin' ? 'employees' : 'my-hours');

    // Date range - default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    // Report data
    const [reportData, setReportData] = useState(null);
    const [teamData, setTeamData] = useState(null);

    // Admin selectors
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTeamsAndUsers();
        }
    }, [user]);

    useEffect(() => {
        fetchReport();
    }, [activeView, startDate, endDate, selectedTeam, selectedUser]);

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

    const fetchReport = async () => {
        if (!startDate || !endDate) return;

        // For employees view, require user selection
        if (activeView === 'employees' && !selectedUser) {
            setReportData(null);
            return;
        }

        // For team hours, require team selection for admins
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
                console.log('Fetching my-hours with params:', params);
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
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    // Convert decimal hours to HH:MM format
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
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>🕒 OnTime</h1>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Work Hours Reports</h2>
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

                <div className="work-session-card">
                    {/* View Toggle for Supervisors */}
                    {(user?.role === 'supervisor' || user?.role === 'admin') && (
                        <div className="view-toggle">
                            {user?.role === 'admin' ? (
                                <>
                                    <button
                                        className={`toggle-btn ${activeView === 'employees' ? 'active' : ''}`}
                                        onClick={() => setActiveView('employees')}
                                    >
                                        Employees
                                    </button>
                                    <button
                                        className={`toggle-btn ${activeView === 'team-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('team-hours')}
                                    >
                                        Team Hours
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className={`toggle-btn ${activeView === 'my-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('my-hours')}
                                    >
                                        My Hours
                                    </button>
                                    <button
                                        className={`toggle-btn ${activeView === 'team-hours' ? 'active' : ''}`}
                                        onClick={() => setActiveView('team-hours')}
                                    >
                                        Team Hours
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Date Range Picker */}
                    <div className="date-range-picker">
                        <div className="date-input-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                        </div>
                        <div className="date-input-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={today.toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Admin Selectors */}
                        {user?.role === 'admin' && activeView === 'employees' && (
                            <div className="date-input-group">
                                <label>Select Employee</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">-- Select an Employee --</option>
                                    {Array.isArray(users) && users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {user?.role === 'admin' && activeView === 'team-hours' && (
                            <div className="date-input-group">
                                <label>Select Team</label>
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">-- Select a Team --</option>
                                    {Array.isArray(teams) && teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button onClick={fetchReport} className="btn-primary" style={{ marginTop: '1.5rem' }}>
                            Generate Report
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="loading">Loading report...</div>
                    ) : (activeView === 'my-hours' || activeView === 'employees') && reportData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="report-summary">
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.total_hours)}</div>
                                    <div className="summary-label">Total Hours</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.net_hours)}</div>
                                    <div className="summary-label">Net Hours (Total - Breaks)</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{reportData.summary.days_worked}</div>
                                    <div className="summary-label">Days Worked</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(reportData.summary.avg_hours_per_day)}</div>
                                    <div className="summary-label">Avg Hours/Day</div>
                                </div>
                            </div>

                            {/* Break Summary */}
                            {Object.keys(reportData.break_summary).length > 0 && (
                                <div className="break-summary-section">
                                    <h3>Break Time Summary</h3>
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

                            {/* Work Sessions Table */}
                            <div className="report-table-container">
                                <h3>Work Sessions</h3>
                                {reportData.sessions.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>
                                        No work sessions found for this period
                                    </p>
                                ) : (
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Clock In</th>
                                                <th>Clock Out</th>
                                                <th>Total Hours</th>
                                                <th>Break Time</th>
                                                <th>Net Hours</th>
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
                            {/* Team Name Display */}
                            {teamData.team && (
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--white)', margin: 0 }}>🏢 {teamData.team.name}</h3>
                                </div>
                            )}

                            {/* Team Summary */}
                            <div className="report-summary">
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(teamData.team_summary.total_hours)}</div>
                                    <div className="summary-label">Team Total Hours</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{formatHoursMinutes(teamData.team_summary.avg_hours_per_member)}</div>
                                    <div className="summary-label">Avg per Member</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{teamData.team_summary.members_count}</div>
                                    <div className="summary-label">Active Members</div>
                                </div>
                            </div>

                            {/* Team Members List */}
                            <div className="team-hours-container">
                                <h3>Team Member Hours</h3>
                                {teamData.team_members.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>
                                        No work sessions found for team members in this period
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
                                                    <span>{member.days_worked} days</span>
                                                    <span>{formatHoursMinutes(member.avg_hours)} avg</span>
                                                </div>
                                            </div>
                                            <details className="session-details">
                                                <summary>View Sessions ({member.sessions.length})</summary>
                                                <table className="report-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Clock In</th>
                                                            <th>Clock Out</th>
                                                            <th>Total Hours</th>
                                                            <th>Net Hours</th>
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
                            {activeView === 'employees' ? 'Select an employee and click "Generate Report"' : activeView === 'team-hours' ? 'Select a team and click "Generate Report"' : 'Select a date range and click "Generate Report"'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
