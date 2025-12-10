import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, update, db } from '../../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNotification } from '../../contexts/NotificationContext';
import { Save, User, BookOpen, Clock, DollarSign, Lock } from 'lucide-react';

function StudentProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uid, setUid] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const { showSuccess, showError } = useNotification();

    const [formData, setFormData] = useState({
        name: '',
        level: 'Beginner',
        goals: '',
        budget: '',
        preferredTimes: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUid(u.uid);
                setUserEmail(u.email || '');
                const sRef = ref(db, `students/${u.uid}`);
                onValue(sRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.val();
                        setFormData({
                            name: data.name || '',
                            level: data.level || 'Beginner',
                            goals: data.goals || '',
                            budget: data.budget || '',
                            preferredTimes: data.preferredTimes || ''
                        });
                    }
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!uid) throw new Error("Not authenticated");

            await update(ref(db, `students/${uid}`), {
                name: formData.name,
                level: formData.level,
                goals: formData.goals,
                budget: formData.budget,
                preferredTimes: formData.preferredTimes
            });

            showSuccess('Profile updated successfully');
        } catch (err) {
            showError('Failed to update profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        setSaving(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");

            // Re-authenticate user before changing password
            const credential = EmailAuthProvider.credential(
                userEmail,
                passwordData.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, passwordData.newPassword);

            showSuccess('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            if (err.code === 'auth/wrong-password') {
                showError('Current password is incorrect');
            } else {
                showError('Failed to update password: ' + err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;

    return (
        <div className="profile-container">
            {/* Profile Information Section */}
            <div className="content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <User size={24} color="#0066ff" />
                    <h3 style={{ margin: 0 }}>My Profile</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={16} /> English Level
                        </label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                        >
                            <option value="Beginner">Beginner (A1-A2)</option>
                            <option value="Intermediate">Intermediate (B1-B2)</option>
                            <option value="Advanced">Advanced (C1-C2)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={16} /> Budget (per hour)
                        </label>
                        <input
                            type="text"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="e.g. $5"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} /> Preferred Schedule
                        </label>
                        <textarea
                            name="preferredTimes"
                            value={formData.preferredTimes}
                            onChange={handleChange}
                            placeholder="e.g. Weekdays after 6 PM, Weekends anytime"
                            rows="3"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Learning Goals</label>
                        <textarea
                            name="goals"
                            value={formData.goals}
                            onChange={handleChange}
                            placeholder="What do you want to achieve? e.g. Improve speaking for business, pass IELTS..."
                            rows="4"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Password Change Section */}
            <div className="content-card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Lock size={24} color="#ef4444" />
                    <h3 style={{ margin: 0 }}>Change Password</h3>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password (min 6 characters)"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Lock size={18} />
                        {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default StudentProfile;
