import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';

import { Users, Calendar, Banknote, Wallet, CreditCard } from 'lucide-react';

function TeacherDashboard() {
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUid(u.uid);
                const tRef = ref(db, `teachers/${u.uid}`);
                onValue(tRef, (snap) => setTeacher(snap.val()));
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        // Fetch Matches (Students)
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const arr = Object.keys(all)
                .filter((k) => all[k].teacherId === uid)
                .map((k) => ({ id: k, ...all[k] }));
            setStudents(arr);
        });

        // Fetch Payments
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const arr = Object.keys(all)
                .filter((k) => all[k].teacherId === uid)
                .map((k) => ({ id: k, ...all[k] }));
            setPayments(arr);
        });

        return () => {
            unsubMatches();
            unsubPayments();
        };
    }, [uid]);

    const getPaymentStatus = (studentId) => {
        const payment = payments.find(p => p.studentId === studentId);
        if (!payment) {
            return { status: 'Unpaid', amount: 0, method: '-' };
        }
        if (payment.confirmed) {
            return { status: 'Paid', amount: payment.amount, method: payment.paymentMethod };
        } else {
            return { status: 'Pending Confirmation', amount: payment.amount, method: payment.paymentMethod };
        }
    };

    return (
        <div>
            <div className="dashboard-stats">
                <div className="stat-card compact">
                    <div className="stat-icon-wrapper blue">
                        <Calendar size={20} />
                    </div>
                    <div className="stat-content">
                        <h4>Slots Available</h4>
                        <div className="stat-value">{teacher ? teacher.slotsAvailable : '—'}</div>
                    </div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-icon-wrapper orange">
                        <Users size={20} />
                    </div>
                    <div className="stat-content">
                        <h4>Students</h4>
                        <div className="stat-value">{teacher ? teacher.slotsUsed : '—'}</div>
                    </div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-icon-wrapper green">
                        <Banknote size={20} />
                    </div>
                    <div className="stat-content">
                        <h4>Hourly Rate</h4>
                        <div className="stat-value">₦{teacher ? teacher.ratePerHour || 0 : '—'}</div>
                    </div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-icon-wrapper purple">
                        <Wallet size={20} />
                    </div>
                    <div className="stat-content">
                        <h4>Total Earned</h4>
                        <div className="stat-value" style={{ color: '#10b981' }}>
                            ₦{payments.filter(p => p.confirmed === true).reduce((acc, p) => acc + (p.teacherReceives || 0), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-icon-wrapper gray">
                        <CreditCard size={20} />
                    </div>
                    <div className="stat-content">
                        <h4>Payment Method</h4>
                        <div className="stat-value" style={{ fontSize: '1rem' }}>
                            {teacher ? (teacher.paymentMethod === 'platform' ? 'EnglishHop' : 'Direct') : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-card mt-4">
                <h3>Recent Students & Payments</h3>
                {students.length === 0 && <div className="empty-state">No students yet.</div>}
                {students.map((s) => {
                    const payInfo = getPaymentStatus(s.studentId);
                    return (
                        <div key={s.id} className="list-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>Student ID: {s.studentId}</strong>
                                    <p>
                                        Agreed Rate: ₦{s.rate}/hr
                                        {teacher && teacher.ratePerHour && s.rate !== teacher.ratePerHour && (
                                            <span style={{ color: '#ef4444', fontSize: '0.9em', marginLeft: '5px' }}>
                                                (Standard: ₦{teacher.ratePerHour})
                                            </span>
                                        )}
                                        <br />
                                        Method: {s.paymentMethod}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge ${payInfo.status === 'Paid' ? 'success' : payInfo.status === 'Pending Confirmation' ? 'warning' : 'danger'}`}
                                        style={{
                                            background: payInfo.status === 'Paid' ? '#d1fae5' : payInfo.status === 'Pending Confirmation' ? '#fff7ed' : '#fee',
                                            color: payInfo.status === 'Paid' ? '#065f46' : payInfo.status === 'Pending Confirmation' ? '#f97316' : '#ef4444',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem'
                                        }}>
                                        {payInfo.status}
                                    </span>
                                    {payInfo.status === 'Paid' && (
                                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                            Paid ₦{payInfo.amount} via {payInfo.method}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TeacherDashboard;
