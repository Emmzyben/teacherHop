import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, update, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { CheckCircle, Clock, User } from 'lucide-react';

function TeacherPayments() {
    const { showSuccess, showError } = useNotification();
    const [uid, setUid] = useState(null);
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        // Fetch payments for this teacher
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const teacherPayments = Object.keys(all)
                .filter((k) => all[k].teacherId === uid)
                .map((k) => ({ id: k, ...all[k] }));
            setPayments(teacherPayments);
        });

        // Fetch students data
        const studentsRef = ref(db, 'students');
        const unsubStudents = onValue(studentsRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setStudents(val);
            setLoading(false);
        });

        return () => {
            unsubPayments();
            unsubStudents();
        };
    }, [uid]);

    const getStudentName = (studentId) => {
        return students[studentId]?.name || studentId;
    };

    const confirmPayment = async (paymentId) => {
        try {
            await update(ref(db, `payments/${paymentId}`), {
                confirmed: true,
                confirmedAt: Date.now()
            });
            showSuccess('Payment confirmed successfully!');
        } catch (err) {
            showError('Failed to confirm payment: ' + err.message);
        }
    };

    const pendingPayments = payments.filter(p => !p.confirmed && p.paymentMethod === 'direct');
    const confirmedPayments = payments.filter(p => p.confirmed);

    if (loading) {
        return <div className="loading">Loading payments...</div>;
    }

    return (
        <div>
            {/* Pending Payments */}
            <div className="content-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={24} color="#f97316" />
                    Pending Payment Confirmations
                </h3>

                {pendingPayments.length === 0 ? (
                    <div className="empty-state">No pending payment confirmations.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {pendingPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="list-item"
                                style={{
                                    background: '#fff7ed',
                                    border: '2px solid #f97316',
                                    borderRadius: '8px',
                                    padding: '1.5rem'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <User size={18} color="#0066ff" />
                                            <strong style={{ fontSize: '1.1rem' }}>{getStudentName(payment.studentId)}</strong>
                                        </div>
                                        <p style={{ margin: '4px 0', color: '#666' }}>
                                            <strong>Amount:</strong> ${payment.amount?.toLocaleString()}
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#666' }}>
                                            <strong>You'll Receive:</strong> ${payment.teacherReceives?.toLocaleString()}
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#888', fontSize: '0.9rem' }}>
                                            Submitted: {new Date(payment.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => confirmPayment(payment.id)}
                                        className="btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <CheckCircle size={18} />
                                        Confirm Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmed Payments */}
            <div className="content-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={24} color="#10b981" />
                    Confirmed Payments
                </h3>

                {confirmedPayments.length === 0 ? (
                    <div className="empty-state">No confirmed payments yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        {confirmedPayments.map((payment) => (
                            <div key={payment.id} className="list-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div>
                                        <strong>{getStudentName(payment.studentId)}</strong>
                                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0' }}>
                                            ${payment.amount?.toLocaleString()} ({payment.paymentMethod === 'platform' ? 'Platform' : 'Direct'})
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#10b981', fontWeight: '600' }}>✓ Confirmed</p>
                                        <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                            {new Date(payment.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherPayments;
