import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [activeBreak, setActiveBreak] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch active work session
    const fetchActiveSession = async () => {
        try {
            const response = await api.get('/work-sessions/active');
            const session = response.data.session;
            setActiveSession(session);

            // Check if there's an active break
            if (session?.breaks) {
                const currentBreak = session.breaks.find(b => !b.ended_at);
                setActiveBreak(currentBreak || null);
            }
        } catch (err) {
            console.error('Error fetching session:', err);
        }
    };

    useEffect(() => {
        fetchActiveSession();
        // Refresh every 30 seconds
        const interval = setInterval(fetchActiveSession, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleClockIn = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/work-sessions/clock-in');
            setActiveSession(response.data.session);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to clock in');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/work-sessions/clock-out');
            setActiveSession(null);
            setActiveBreak(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to clock out');
        } finally {
            setLoading(false);
        }
    };

    const handleStartBreak = async (breakType, isPaid) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/breaks/start', {
                break_type: breakType,
                is_paid: isPaid,
            });
            setActiveBreak(response.data.break);
            await fetchActiveSession(); // Refresh to get updated breaks
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start break');
        } finally {
            setLoading(false);
        }
    };

    const handleEndBreak = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/breaks/end');
            setActiveBreak(null);
            await fetchActiveSession(); // Refresh to get updated breaks
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end break');
        } finally {
            setLoading(false);
        }
    };

    const getWorkDuration = () => {
        if (!activeSession?.started_at) return '00:00:00';
        const start = new Date(activeSession.started_at);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000); // seconds
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const [timer, setTimer] = useState(getWorkDuration());

    useEffect(() => {
        if (activeSession && !activeSession.ended_at) {
            const interval = setInterval(() => {
                setTimer(getWorkDuration());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeSession]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>🕒 OnTime</h1>
                        <p className="user-email">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="btn-secondary">
                        Logout
                    </button>
                </div>

                <div className="welcome-card">
                    <h2>Welcome back, {user?.name}!</h2>
                    <p>Role: <strong>{user?.role}</strong></p>
                    {user?.team && <p>Team: <strong>{user.team.name}</strong></p>}
                </div>

                {error && (
                    <div className="error-message" style={{ marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                {/* Work Session Card */}
                <div className="work-session-card">
                    <h3>⏰ Work Session</h3>

                    {!activeSession ? (
                        <div className="status-section">
                            <p className="status-text">Not clocked in</p>
                            <button
                                onClick={handleClockIn}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Clocking in...' : '🟢 Clock In'}
                            </button>
                        </div>
                    ) : (
                        <div className="active-session">
                            <div className="timer-display">
                                <div className="status-badge working">Working</div>
                                <div className="timer">{timer}</div>
                                <p className="session-start">
                                    Started at {new Date(activeSession.started_at).toLocaleTimeString()}
                                </p>
                            </div>

                            {!activeBreak ? (
                                <div className="break-controls">
                                    <h4>Take a Break</h4>
                                    <div className="break-buttons">
                                        <button
                                            onClick={() => handleStartBreak('coffee', true)}
                                            className="btn-break"
                                            disabled={loading}
                                        >
                                            ☕ Coffee
                                        </button>
                                        <button
                                            onClick={() => handleStartBreak('lunch', true)}
                                            className="btn-break"
                                            disabled={loading}
                                        >
                                            🍽️ Lunch
                                        </button>
                                        <button
                                            onClick={() => handleStartBreak('personal', false)}
                                            className="btn-break"
                                            disabled={loading}
                                        >
                                            🚶 Personal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="active-break">
                                    <div className="status-badge break">On Break</div>
                                    <p>Break Type: <strong>{activeBreak.break_type}</strong></p>
                                    <p>Started: {new Date(activeBreak.started_at).toLocaleTimeString()}</p>
                                    <button
                                        onClick={handleEndBreak}
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Ending...' : '⏸️ End Break'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleClockOut}
                                className="btn-danger"
                                disabled={loading}
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? 'Clocking out...' : '🔴 Clock Out'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
