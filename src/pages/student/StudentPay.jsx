import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, push, set, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';

function StudentPay() {
    const { showSuccess, showError, showInfo } = useNotification();
    const [uid, setUid] = useState(null);
    const [match, setMatch] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [payment, setPayment] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
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

    useEffect(() => {
        if (match && match.teacherId) {
            onValue(ref(db, `teachers/${match.teacherId}`), (snap) => {
                setTeacher(snap.val());
            });

            // Check for existing payment
            onValue(ref(db, 'payments'), (snap) => {
                const all = snap.exists() ? snap.val() : {};
                const found = Object.values(all).find(p => p.studentId === uid && p.teacherId === match.teacherId);
                setPayment(found);
            });
        }
    }, [match, uid]);

    async function pay() {
        if (!match) {
            showError('No matched teacher');
            return;
        }

        const amount = match.rate;
        const platformFee = match.paymentMethod === 'platform' ? Math.round(amount * 0.15) : 0;
        const teacherReceives = amount - platformFee;

        const paymentRef = push(ref(db, 'payments'));
        await set(paymentRef, {
            studentId: uid,
            teacherId: match.teacherId,
            amount,
            platformFee,
            teacherReceives,
            paymentMethod: match.paymentMethod,
            confirmed: match.paymentMethod === 'platform', // Platform payments auto-confirm, direct needs teacher confirmation
            timestamp: Date.now()
        });

        if (match.paymentMethod === 'direct') {
            showInfo('Payment marked as sent! Waiting for teacher confirmation.');
        } else {
            showSuccess('Payment successful!');
        }
    }

    if (payment) {
        return (
            <div className="content-card">
                <h3>Payment Status</h3>
                {payment.confirmed ? (
                    <div className="success-state" style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                        <h4>Payment Confirmed</h4>
                        <p style={{ color: '#666', margin: '10px 0' }}>
                            You have successfully paid <strong>${payment.amount}</strong> via {payment.paymentMethod === 'platform' ? 'EnglishHop' : 'Direct Transfer'}.
                        </p>
                        <p style={{ fontWeight: 'bold', color: '#0066ff' }}>Your lessons are currently active.</p>
                    </div>
                ) : (
                    <div className="pending-state" style={{ textAlign: 'center', padding: '20px', background: '#fff7ed', borderRadius: '8px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                        <h4 style={{ color: '#f97316' }}>Awaiting Teacher Confirmation</h4>
                        <p style={{ color: '#666', margin: '10px 0' }}>
                            You've marked the payment of <strong>${payment.amount}</strong> as sent via Direct Transfer.
                        </p>
                        <p style={{ color: '#f97316', fontWeight: '600' }}>
                            Your teacher needs to confirm receipt before lessons can begin.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="content-card">
            <h3>Pay for Lesson</h3>
            {match ? (
                <div>
                    <p><strong>Amount:</strong> ${match.rate}</p>
                    <p><strong>Payment Method:</strong> {match.paymentMethod === 'platform' ? 'EnglishHop Secure Payment' : 'Direct Transfer to Teacher'}</p>

                    {match.paymentMethod === 'direct' && teacher && teacher.bankDetails && (
                        <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', margin: '15px 0', border: '1px solid #e5e7eb' }}>
                            <h4 style={{ marginBottom: '10px', color: '#374151' }}>Teacher's Bank Details:</h4>
                            {typeof teacher.bankDetails === 'string' ? (
                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#4b5563' }}>
                                    {teacher.bankDetails}
                                </pre>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px', color: '#4b5563' }}>
                                    <p><strong>Bank Name:</strong> {teacher.bankDetails.bankName}</p>
                                    <p><strong>Account Name:</strong> {teacher.bankDetails.accountName}</p>
                                    <p><strong>Account Number:</strong> {teacher.bankDetails.accountNumber}</p>
                                </div>
                            )}
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
                                Please transfer <strong>${match.rate}</strong> to the account above and then click the button below.
                            </p>
                        </div>
                    )}

                    <button onClick={pay} className="btn-primary-full">
                        {match.paymentMethod === 'direct' ? 'I Have Made the Transfer' : 'Pay Now (Simulated)'}
                    </button>
                </div>
            ) : (
                <div className="empty-state">No matched teacher.</div>
            )}
        </div>
    );
}

export default StudentPay;
