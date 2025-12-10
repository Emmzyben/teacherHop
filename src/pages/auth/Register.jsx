import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, ref, set, db } from '../../lib/firebase';
import { Eye, EyeOff } from 'lucide-react';
import TeacherTermsModal from '../../components/TeacherTermsModal';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('teacher');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character";
        return null;
    };

    async function handleRegister(e) {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (role === 'teacher') {
            setShowModal(true);
        } else {
            performRegistration();
        }
    }

    async function performRegistration() {
        setLoading(true);
        setShowModal(false); // Close modal if open

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // Create user profile
            await set(ref(db, `users/${uid}`), {
                email,
                role,
                createdAt: Date.now()
            });

            // Create role-specific profile
            if (role === 'teacher') {
                await set(ref(db, `teachers/${uid}`), {
                    name: email.split('@')[0],
                    email,
                    ratePerHour: 0,
                    paymentMethod: 'direct',
                    slotsPurchased: 0,
                    slotsUsed: 0,
                    slotsAvailable: 0
                });
                navigate('/teacher');
            } else if (role === 'student') {
                await set(ref(db, `students/${uid}`), {
                    name: email.split('@')[0],
                    email,
                    level: '',
                    goals: '',
                    preferredTimes: '',
                    matchedTeacher: null
                });
                navigate('/student');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please login instead.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak.');
            } else {
                setError('Failed to register. ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '0.8em' }}>
                            Must be 8+ chars with 1 uppercase & 1 special char
                        </small>
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary-full" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
            </div>

            <TeacherTermsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onProceed={performRegistration}
            />
        </div>
    );
}

export default Register;
