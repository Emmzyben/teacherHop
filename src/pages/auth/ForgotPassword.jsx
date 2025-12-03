import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, sendPasswordResetEmail } from '../../lib/firebase';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            setMessage('Check your inbox for further instructions');
        } catch (err) {
            setError('Failed to reset password. ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Password Reset</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    color: '#2f855a',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email address"
                        />
                    </div>
                    <button disabled={loading} type="submit" className="btn-primary-full">
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
                <div className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
