import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PrintableReport() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);
    const [teamData, setTeamData] = useState(null);

    // Get parameters from URL
    const reportType = searchParams.get('type'); // 'personal' or 'team'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userId = searchParams.get('user_id');
    const teamId = searchParams.get('team_id');
    const userName = searchParams.get('user_name');
    const teamName = searchParams.get('team_name');

    useEffect(() => {
        fetchReportData();
    }, []);

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
            setError(err.response?.data?.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const formatHoursMinutes = (decimalHours) => {
        if (!decimalHours && decimalHours !== 0) return '0:00';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const formatTime = (time) => {
        if (!time) return '—';
        return time.substring(0, 5);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="print-page">
                <div className="print-loading">Loading report...</div>
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
            {/* Report Header */}
            <div className="print-header">
                <h1>🕒 OnTime</h1>
                <h2>Work Hours Report</h2>
                <p className="print-date-range">
                    {formatDate(startDate)} - {formatDate(endDate)}
                </p>
                {userName && <p className="print-subtitle">Employee: {userName}</p>}
                {teamName && <p className="print-subtitle">Team: {teamName}</p>}
            </div>

            {/* Personal Report */}
            {reportType === 'personal' && reportData && (
                <div className="print-content">
                    {/* Summary */}
                    <div className="print-summary">
                        <div className="print-summary-item">
                            <span className="label">Total Hours:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.total_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Net Hours:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.net_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Days Worked:</span>
                            <span className="value">{reportData.summary.days_worked}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Average Hours/Day:</span>
                            <span className="value">{formatHoursMinutes(reportData.summary.avg_hours_per_day)}</span>
                        </div>
                    </div>

                    {/* Work Sessions Table */}
                    <h3>Work Sessions</h3>
                    <table className="print-table">
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

                    {/* Break Summary */}
                    {Object.keys(reportData.break_summary).length > 0 && (
                        <>
                            <h3>Break Time Summary</h3>
                            <table className="print-table print-table-simple">
                                <thead>
                                    <tr>
                                        <th>Break Type</th>
                                        <th>Total Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reportData.break_summary).map(([type, hours]) => (
                                        <tr key={type}>
                                            <td>{type}</td>
                                            <td>{formatHoursMinutes(hours)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Team Report */}
            {reportType === 'team' && teamData && (
                <div className="print-content">
                    {/* Team Summary */}
                    <div className="print-summary">
                        <div className="print-summary-item">
                            <span className="label">Team Total Hours:</span>
                            <span className="value">{formatHoursMinutes(teamData.team_summary.total_hours)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Average per Member:</span>
                            <span className="value">{formatHoursMinutes(teamData.team_summary.avg_hours_per_member)}</span>
                        </div>
                        <div className="print-summary-item">
                            <span className="label">Active Members:</span>
                            <span className="value">{teamData.team_summary.members_count}</span>
                        </div>
                    </div>

                    {/* Team Members */}
                    <h3>Team Members</h3>
                    {teamData.team_members.map(member => (
                        <div key={member.user.id} className="print-member-section">
                            <h4>{member.user.name}</h4>
                            <p className="member-email">{member.user.email}</p>
                            <p className="member-stats">
                                Total: <strong>{formatHoursMinutes(member.total_hours)}</strong> |
                                Days: {member.days_worked} |
                                Average: {formatHoursMinutes(member.avg_hours)}
                            </p>

                            <table className="print-table">
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
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="print-footer">
                <p>Generated on: {new Date().toLocaleString()}</p>
                <p>OnTime - Work Hours Management System</p>
            </div>
        </div>
    );
}
