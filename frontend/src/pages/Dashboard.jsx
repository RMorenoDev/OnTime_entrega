import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🕒 OnTime Dashboard</h1>
                <button onClick={handleLogout} className="btn-secondary">
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, {user?.name}! 👋</h2>
                    <p className="user-email">{user?.email}</p>
                    <div className="info-box">
                        <p>✅ You are successfully logged in with Laravel Sanctum!</p>
                        <p>🚀 This is your protected dashboard.</p>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>🕘 Clock In/Out</h3>
                        <p>Track your work hours</p>
                        <span className="badge">Coming Soon</span>
                    </div>
                    <div className="feature-card">
                        <h3>☕ Break Management</h3>
                        <p>Log your breaks</p>
                        <span className="badge">Coming Soon</span>
                    </div>
                    <div className="feature-card">
                        <h3>🗓️ Leave Requests</h3>
                        <p>Request time off</p>
                        <span className="badge">Coming Soon</span>
                    </div>
                    <div className="feature-card">
                        <h3>📊 Reports</h3>
                        <p>View your statistics</p>
                        <span className="badge">Coming Soon</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
