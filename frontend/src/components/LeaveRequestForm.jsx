import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function LeaveRequestForm({ onSuccess, onCancel }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        leave_type: 'vacation',
        is_paid: true,
        is_full_day: true,
        duration_hours: 4.0,
        start_at: '',
        end_at: '',
        note: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                // Only send end_at for full day requests
                end_at: formData.is_full_day ? formData.end_at : null,
                // Only send duration_hours for partial day requests
                duration_hours: !formData.is_full_day ? parseFloat(formData.duration_hours) : null,
            };

            await api.post('/leave-requests', payload);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Generate half-hour options (0.5 to 24 in 0.5 increments)
    const hourOptions = [];
    for (let i = 0.5; i <= 24; i += 0.5) {
        hourOptions.push(i);
    }

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    // Get current datetime in YYYY-MM-DDTHH:MM format
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const currentDateTime = now.toISOString().slice(0, 16);

    return (
        <div className="leave-request-form-container">
            <div className="form-header">
                <h2>📝 Request Leave</h2>
                {onCancel && (
                    <button onClick={onCancel} className="btn-close">✕</button>
                )}
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="leave-form">
                <div className="form-group">
                    <label htmlFor="leave_type">Leave Type *</label>
                    <select
                        id="leave_type"
                        name="leave_type"
                        value={formData.leave_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="vacation">🏖️ Vacation</option>
                        <option value="medical">🏥 Medical</option>
                        <option value="personal">🚶 Personal</option>
                    </select>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="is_paid"
                            checked={formData.is_paid}
                            onChange={handleChange}
                        />
                        Paid Leave
                    </label>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="is_full_day"
                            checked={formData.is_full_day}
                            onChange={handleChange}
                        />
                        Full Day(s)
                    </label>
                </div>

                {formData.is_full_day ? (
                    <>
                        <div className="form-group">
                            <label htmlFor="start_at">Start Date *</label>
                            <input
                                type="date"
                                id="start_at"
                                name="start_at"
                                value={formData.start_at}
                                onChange={handleChange}
                                min={today}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end_at">End Date *</label>
                            <input
                                type="date"
                                id="end_at"
                                name="end_at"
                                value={formData.end_at}
                                onChange={handleChange}
                                min={formData.start_at || today}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="start_at">Date & Time *</label>
                            <input
                                type="datetime-local"
                                id="start_at"
                                name="start_at"
                                value={formData.start_at}
                                onChange={handleChange}
                                min={currentDateTime}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration_hours">Duration (hours) *</label>
                            <select
                                id="duration_hours"
                                name="duration_hours"
                                value={formData.duration_hours}
                                onChange={handleChange}
                                required
                            >
                                {hourOptions.map(hours => (
                                    <option key={hours} value={hours}>
                                        {hours} {hours === 1 ? 'hour' : 'hours'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label htmlFor="note">Reason *</label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Please provide a reason for your leave request..."
                        required
                        maxLength="1000"
                    />
                    <small>{formData.note.length}/1000 characters</small>
                </div>

                <div className="form-actions">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
