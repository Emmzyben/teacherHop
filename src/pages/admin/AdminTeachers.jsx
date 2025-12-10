import React, { useEffect, useState } from 'react';
import { ref, onValue, db } from '../../lib/firebase';
import { X, User, Banknote, Calendar, CreditCard, Mail, Briefcase } from 'lucide-react';

function AdminTeachers() {
    const [list, setList] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        const unsubscribe = onValue(ref(db, 'teachers'), (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setList(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
        });
        return unsubscribe;
    }, []);

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const closeModal = () => {
        setSelectedTeacher(null);
    };

    return (
        <>
            <div className="content-card">
                <h3>Teachers</h3>
                {list.length === 0 && <div className="empty-state">No teachers yet.</div>}
                {list.map((t) => (
                    <div
                        key={t.id}
                        className="list-item"
                        onClick={() => handleTeacherClick(t)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div>
                            <strong>{t.name}</strong>
                            <p>Slots: {t.slotsAvailable || 0} available / {t.slotsUsed || 0} used</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teacher Profile Modal */}
            {selectedTeacher && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                <Briefcase size={24} color="#0066ff" />
                                Teacher Profile
                            </h3>
                            <button onClick={closeModal} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="profile-section">
                                <div className="profile-field">
                                    <div className="profile-label">
                                        <User size={18} />
                                        <span>Name</span>
                                    </div>
                                    <div className="profile-value">{selectedTeacher.name || 'Not provided'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Mail size={18} />
                                        <span>Email</span>
                                    </div>
                                    <div className="profile-value">{selectedTeacher.email || 'Not provided'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Banknote size={18} />
                                        <span>Hourly Rate</span>
                                    </div>
                                    <div className="profile-value">${selectedTeacher.ratePerHour || 0}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <CreditCard size={18} />
                                        <span>Payment Method</span>
                                    </div>
                                    <div className="profile-value">
                                        {selectedTeacher.paymentMethod === 'platform' ? 'EnglishHop Platform' : 'Direct Payment'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Calendar size={18} />
                                        <span>Slots Purchased</span>
                                    </div>
                                    <div className="profile-value">{selectedTeacher.slotsPurchased || 0}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Calendar size={18} />
                                        <span>Slots Used</span>
                                    </div>
                                    <div className="profile-value">{selectedTeacher.slotsUsed || 0}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Calendar size={18} />
                                        <span>Slots Available</span>
                                    </div>
                                    <div className="profile-value">{selectedTeacher.slotsAvailable || 0}</div>
                                </div>

                                {selectedTeacher.paymentDetails && (
                                    <>
                                        <div className="profile-field" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                            <div className="profile-label">
                                                <CreditCard size={18} />
                                                <span>Payment Details</span>
                                            </div>
                                        </div>

                                        <div className="profile-field">
                                            <div className="profile-label">
                                                <span style={{ paddingLeft: '1.75rem' }}>Bank</span>
                                            </div>
                                            <div className="profile-value">{selectedTeacher.paymentDetails.bank || 'Not provided'}</div>
                                        </div>

                                        <div className="profile-field">
                                            <div className="profile-label">
                                                <span style={{ paddingLeft: '1.75rem' }}>Account Name</span>
                                            </div>
                                            <div className="profile-value">{selectedTeacher.paymentDetails.accountName || 'Not provided'}</div>
                                        </div>

                                        <div className="profile-field">
                                            <div className="profile-label">
                                                <span style={{ paddingLeft: '1.75rem' }}>Account Number</span>
                                            </div>
                                            <div className="profile-value">{selectedTeacher.paymentDetails.accountNumber || 'Not provided'}</div>
                                        </div>
                                    </>
                                )}

                                <div className="profile-field" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                    <div className="profile-label">
                                        <span>Teacher ID</span>
                                    </div>
                                    <div className="profile-value" style={{ fontSize: '0.85rem', color: '#888' }}>
                                        {selectedTeacher.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminTeachers;
