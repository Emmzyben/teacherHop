import React, { useEffect, useState } from 'react';
import { ref, onValue, db } from '../../lib/firebase';
import { X, User, BookOpen, Target, DollarSign, Clock, Mail } from 'lucide-react';

function AdminStudents() {
    const [list, setList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const unsubscribe = onValue(ref(db, 'students'), (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setList(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
        });
        return unsubscribe;
    }, []);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    return (
        <>
            <div className="content-card">
                <h3>Students</h3>
                {list.length === 0 && <div className="empty-state">No students yet.</div>}
                {list.map((s) => (
                    <div
                        key={s.id}
                        className="list-item"
                        onClick={() => handleStudentClick(s)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div>
                            <strong>{s.name}</strong>
                            <p>Level: {s.level || 'Not set'} — Matched: {s.matchedTeacher || 'No'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Student Profile Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                <User size={24} color="#0066ff" />
                                Student Profile
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
                                    <div className="profile-value">{selectedStudent.name || 'Not provided'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Mail size={18} />
                                        <span>Email</span>
                                    </div>
                                    <div className="profile-value">{selectedStudent.email || 'Not provided'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <BookOpen size={18} />
                                        <span>English Level</span>
                                    </div>
                                    <div className="profile-value">{selectedStudent.level || 'Not set'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <DollarSign size={18} />
                                        <span>Budget</span>
                                    </div>
                                    <div className="profile-value">{selectedStudent.budget || 'Not specified'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Clock size={18} />
                                        <span>Preferred Schedule</span>
                                    </div>
                                    <div className="profile-value">{selectedStudent.preferredTimes || 'Not specified'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <Target size={18} />
                                        <span>Learning Goals</span>
                                    </div>
                                    <div className="profile-value">{selectedStudent.goals || 'Not specified'}</div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <User size={18} />
                                        <span>Matched Teacher</span>
                                    </div>
                                    <div className="profile-value">
                                        {selectedStudent.matchedTeacher || 'Not matched yet'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <div className="profile-label">
                                        <span>Student ID</span>
                                    </div>
                                    <div className="profile-value" style={{ fontSize: '0.85rem', color: '#888' }}>
                                        {selectedStudent.id}
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

export default AdminStudents;
