import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/ontime_logo.png';
import CustomSelect from '../components/CustomSelect';
import '../index.css';

export default function Register() {
    const [name, setName] = useState(''); // Nombre completo
    const [email, setEmail] = useState(''); // Email
    const [password, setPassword] = useState(''); // Password
    const [passwordConfirmation, setPasswordConfirmation] = useState(''); // Confirmacion
    const [role, setRole] = useState(''); // Rol seleccionado
    const [teamName, setTeamName] = useState(''); // Nombre del equipo
    const [teams, setTeams] = useState([]); // Equipos disponibles
    const [filteredTeams, setFilteredTeams] = useState([]); // Equipos filtrados para supervisor
    const [showSuggestions, setShowSuggestions] = useState(false); // Toggle de sugerencias
    const [errors, setErrors] = useState({}); // Errores de validacion/API
    const [loading, setLoading] = useState(false); // Estado de envio
    const { register } = useAuth();
    const navigate = useNavigate();

    // Obtener equipos al montar
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams');
                // La API devuelve {teams: [...]}
                const teamsData = response.data.teams || [];
                setTeams(teamsData);
                setFilteredTeams(teamsData);
            } catch (err) {
                console.error('Failed to fetch teams:', err);
            }
        };
        fetchTeams();
    }, []);

    // Filtrar equipos para autocompletar de supervisores
    useEffect(() => {
        if (role === 'supervisor' && teamName) {
            const filtered = teams.filter(team =>
                team.name.toLowerCase().includes(teamName.toLowerCase())
            );
            setFilteredTeams(filtered);
        } else {
            setFilteredTeams(teams);
        }
    }, [teamName, teams, role]);

    // Enviar registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const result = await register(name, email, password, passwordConfirmation, role, teamName);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors(result.errors);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <img src={logo} alt="OnTime Logo" style={{ width: '32px', height: '32px' }} />
                        OnTime
                    </h1>
                    <h2>Create Account</h2>
                    <p>Get started with your free account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="John Doe"
                        />
                        {errors.name && <span className="error-text">{errors.name[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                        {errors.email && <span className="error-text">{errors.email[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <CustomSelect
                            options={[
                                { value: 'employee', label: 'Employee' },
                                { value: 'supervisor', label: 'Supervisor' }
                            ]}
                            value={role}
                            onChange={(value) => setRole(value)}
                            placeholder="Select your role..."
                            required
                        />
                        {errors.role && <span className="error-text">{errors.role[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="teamName">Team {role === 'employee' ? '*' : ''}</label>
                        {role === 'employee' ? (
                            // Selector personalizado para empleados
                            <CustomSelect
                                options={teams.map(team => ({
                                    value: team.name,
                                    label: team.name
                                }))}
                                value={teamName}
                                onChange={(value) => setTeamName(value)}
                                placeholder="Select a team..."
                                disabled={!role}
                                required={role === 'employee'}
                            />
                        ) : (
                            // Input de texto con sugerencias visibles para supervisores
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    id="teamName"
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => {
                                        setTeamName(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Start typing to filter teams..."
                                    disabled={!role}
                                    autoComplete="off"
                                    style={{ width: '100%' }}
                                />
                                {role === 'supervisor' && showSuggestions && filteredTeams.length > 0 && teamName && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        backgroundColor: '#1a1a2e',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        marginTop: '4px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        zIndex: 1000
                                    }}>
                                        {filteredTeams.map(team => (
                                            <div
                                                key={team.id}
                                                onClick={() => {
                                                    setTeamName(team.name);
                                                    setShowSuggestions(false);
                                                }}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                    transition: 'background-color 0.2s',
                                                    color: '#fff'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                {team.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.team_name && <span className="error-text">{errors.team_name[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                        />
                        {errors.password && <span className="error-text">{errors.password[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                        />
                    </div>

                    {errors.message && (
                        <div className="error-message">{errors.message}</div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
