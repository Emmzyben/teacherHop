import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';
import Chat from '../../components/Chat';
import { MessageCircle, Users } from 'lucide-react';

function TeacherChat() {
    const [uid, setUid] = useState(null);
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentsData, setStudentsData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        // Fetch matches (students)
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const teacherStudents = Object.values(all).filter((m) => m.teacherId === uid);
            setStudents(teacherStudents);
        });

        // Fetch confirmed payments
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const confirmedPayments = Object.values(all).filter(
                p => p.teacherId === uid && p.confirmed
            );
            setPayments(confirmedPayments);
        });

        // Fetch students data
        const studentsRef = ref(db, 'students');
        const unsubStudents = onValue(studentsRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setStudentsData(val);
            setLoading(false);
        });

        return () => {
            unsubMatches();
            unsubPayments();
            unsubStudents();
        };
    }, [uid]);

    const getStudentName = (studentId) => {
        return studentsData[studentId]?.name || studentId;
    };

    const hasConfirmedPayment = (studentId) => {
        return payments.some(p => p.studentId === studentId);
    };

    const confirmedStudents = students.filter(s => hasConfirmedPayment(s.studentId));

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (confirmedStudents.length === 0) {
        return (
            <div className="content-card">
                <h3>Student Chats</h3>
                <div className="empty-state">
                    <MessageCircle size={48} color="#ccc" />
                    <p>No students with confirmed payments yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', minHeight: '600px' }}>
            {/* Students List */}
            <div className="content-card" style={{ height: 'fit-content' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <Users size={20} color="#0066ff" />
                    Students
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {confirmedStudents.map((student) => (
                        <div
                            key={student.studentId}
                            onClick={() => setSelectedStudent(student)}
                            className={`list-item ${selectedStudent?.studentId === student.studentId ? 'active' : ''}`}
                            style={{
                                cursor: 'pointer',
                                padding: '1rem',
                                background: selectedStudent?.studentId === student.studentId ? '#eef4ff' : 'white',
                                border: selectedStudent?.studentId === student.studentId ? '2px solid #0066ff' : '1px solid #e0e0e0',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <strong>{getStudentName(student.studentId)}</strong>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0 0' }}>
                                ₦{student.rate}/hr
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="content-card">
                {selectedStudent ? (
                    <Chat
                        currentUserId={uid}
                        otherUserId={selectedStudent.studentId}
                        otherUserName={getStudentName(selectedStudent.studentId)}
                        chatId={`${selectedStudent.studentId}_${uid}`}
                    />
                ) : (
                    <div className="empty-state" style={{ padding: '4rem' }}>
                        <MessageCircle size={48} color="#ccc" />
                        <p>Select a student to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherChat;
