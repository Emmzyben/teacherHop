import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';
import { AlertCircle } from 'lucide-react';

function StudentDashboard() {
    const [match, setMatch] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [student, setStudent] = useState(null);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUid(u.uid);
                // Fetch student data
                onValue(ref(db, `students/${u.uid}`), (snap) => {
                    if (snap.exists()) {
                        setStudent(snap.val());
                    }
                });
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        const unsubscribe = onValue(ref(db, 'matches'), (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const found = Object.keys(all)
                .map((k) => ({ id: k, ...all[k] }))
                .find((m) => m.studentId === uid);
            setMatch(found);
        });

        return unsubscribe;
    }, [uid]);

    // Fetch teacher details when match is found
    useEffect(() => {
        if (!match?.teacherId) {
            setTeacher(null);
            return;
        }

        const unsubscribe = onValue(ref(db, `teachers/${match.teacherId}`), (snap) => {
            if (snap.exists()) {
                setTeacher({ id: match.teacherId, ...snap.val() });
            }
        });

        return unsubscribe;
    }, [match]);

    // Check profile completeness
    const isProfileIncomplete = () => {
        if (!student) return false;

        const missingFields = [];

        if (!student.name || student.name.trim() === '') missingFields.push('Name');
        if (!student.level || student.level.trim() === '') missingFields.push('English Level');
        if (!student.goals || student.goals.trim() === '') missingFields.push('Learning Goals');
        if (!student.preferredTimes || student.preferredTimes.trim() === '') missingFields.push('Preferred Schedule');

        return missingFields;
    };

    const missingFields = isProfileIncomplete();
    const showProfileBanner = missingFields && missingFields.length > 0;

    return (
        <div className="content-card">
            {/* Profile Completion Banner */}
            {showProfileBanner && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    boxShadow: '0 4px 6px rgba(245, 158, 11, 0.1)'
                }}>
                    <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{
                            margin: '0 0 0.5rem 0',
                            color: '#92400e',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}>
                            Complete Your Profile
                        </h4>
                        <p style={{
                            margin: '0 0 0.75rem 0',
                            color: '#78350f',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                        }}>
                            Complete your profile to help teachers understand your learning goals and provide better lessons.
                        </p>
                        <p style={{
                            margin: '0 0 1rem 0',
                            color: '#92400e',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Missing: {missingFields.join(', ')}
                        </p>
                        <Link
                            to="/student/profile"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#f59e0b',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
                        >
                            Complete Profile Now
                        </Link>
                    </div>
                </div>
            )}

            {match && teacher ? (
                <div>
                    <h4>Your Matched Teacher</h4>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="teacher-info-box">
                            <div className="teacher-avatar-small">
                                {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div>
                                <p><strong>Name:</strong> {teacher.name || 'Teacher'}</p>
                                <p><strong>Rate:</strong> ${match.rate}/hr</p>
                                <p><strong>Payment Method:</strong> {match.paymentMethod === 'platform' ? 'EnglishHop Platform' : 'Direct'}</p>
                                {teacher.email && <p><strong>Email:</strong> {teacher.email}</p>}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/student/pay" className="btn-primary">Pay for Lesson</Link>
                        <Link to="/student/chat" className="btn-secondary">Chat with Teacher</Link>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="empty-state">
                        <h4>No Teacher Matched Yet</h4>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Browse our teacher directory and choose a teacher that fits your learning goals
                        </p>
                    </div>
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link to="/browse-teachers" className="btn-primary-lg">
                            Browse Teachers
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;
