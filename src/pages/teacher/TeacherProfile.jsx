import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, update, db } from '../../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNotification } from '../../contexts/NotificationContext';
import { Save, User, MapPin, Phone, Mail, Lock, CreditCard, Building2 } from 'lucide-react';

function TeacherProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uid, setUid] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const { showSuccess, showError } = useNotification();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        qualifications: '',
        experience: '',
        specializations: '',
        bankDetails: {
            bankName: '',
            accountNumber: '',
            accountName: ''
        }
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
                const tRef = ref(db, `teachers/${u.uid}`);
                onValue(tRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.val();
                        setFormData({
                            name: data.name || '',
                            email: data.email || u.email || '',
                            phone: data.phone || '',
                            location: data.location || '',
                            bio: data.bio || '',
                            qualifications: data.qualifications || '',
                            experience: data.experience || '',
                            specializations: data.specializations || '',
                            bankDetails: {
                                bankName: data.bankDetails?.bankName || '',
                                accountNumber: data.bankDetails?.accountNumber || '',
                                accountName: data.bankDetails?.accountName || ''
                            }
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
        if (name.startsWith('bank_')) {
            const bankField = name.replace('bank_', '');
            setFormData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [bankField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!uid) throw new Error("Not authenticated");

            await update(ref(db, `teachers/${uid}`), {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                qualifications: formData.qualifications,
                experience: formData.experience,
                specializations: formData.specializations,
                bankDetails: formData.bankDetails
            });

            showSuccess('Profile updated successfully');
        } catch (err) {
            showError('Failed to update profile: ' + err.message);
        } finally {
            setSaving(false);
        }
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
                    <h3 style={{ margin: 0 }}>Profile Information</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your Full Name"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={16} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Bio / About Me</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell students about yourself, your teaching style, and approach..."
                            rows="4"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Qualifications</label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            placeholder="e.g. Bachelor's in English Literature, TEFL Certified..."
                            rows="3"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Teaching Experience</label>
                            <input
                                type="text"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="e.g. 5 years"
                            />
                        </div>

                        <div className="form-group">
                            <label>Specializations</label>
                            <input
                                type="text"
                                name="specializations"
                                value={formData.specializations}
                                onChange={handleChange}
                                placeholder="e.g. Business English, IELTS Preparation"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Bank Details Section */}
            <div className="content-card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <CreditCard size={24} color="#10b981" />
                    <h3 style={{ margin: 0 }}>Bank Details</h3>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                    For students using direct payment method
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} /> Bank Name
                        </label>
                        <input
                            type="text"
                            name="bank_bankName"
                            value={formData.bankDetails.bankName}
                            onChange={handleChange}
                            placeholder="e.g. Chase Bank"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                name="bank_accountNumber"
                                value={formData.bankDetails.accountNumber}
                                onChange={handleChange}
                                placeholder="1234567890"
                            />
                        </div>

                        <div className="form-group">
                            <label>Account Name</label>
                            <input
                                type="text"
                                name="bank_accountName"
                                value={formData.bankDetails.accountName}
                                onChange={handleChange}
                                placeholder="Account Holder Name"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Bank Details'}
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

export default TeacherProfile;
