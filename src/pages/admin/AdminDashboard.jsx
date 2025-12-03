import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, db } from '../../lib/firebase';
import { Users, Briefcase, Link2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

function AdminDashboard() {
    const [matches, setMatches] = useState([]);
    const [students, setStudents] = useState({});
    const [teachers, setTeachers] = useState({});
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch matches
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            const matchList = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
            setMatches(matchList);
        });

        // Fetch students
        const studentsRef = ref(db, 'students');
        const unsubStudents = onValue(studentsRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setStudents(val);
        });

        // Fetch teachers
        const teachersRef = ref(db, 'teachers');
        const unsubTeachers = onValue(teachersRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setTeachers(val);
        });

        // Fetch payments
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            const paymentList = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
            setPayments(paymentList);
            setLoading(false);
        });

        return () => {
            unsubMatches();
            unsubStudents();
            unsubTeachers();
            unsubPayments();
        };
    }, []);

    const getStudentName = (studentId) => {
        return students[studentId]?.name || studentId;
    };

    const getTeacherName = (teacherId) => {
        return teachers[teacherId]?.name || teacherId;
    };

    const getPaymentStatus = (studentId, teacherId) => {
        const payment = payments.find(
            p => p.studentId === studentId && p.teacherId === teacherId
        );
        return payment ? {
            paid: payment.confirmed === true,
            amount: payment.amount,
            pending: payment.confirmed === false
        } : { paid: false, amount: 0, pending: false };
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div>
            <div className="dashboard-stats" style={{ marginTop: '2rem' }}>
                <div className="stat-card">
                    <h4>Total Matches</h4>
                    <div className="stat-value" style={{ color: '#0066ff' }}>{matches.length}</div>
                </div>
                <div className="stat-card">
                    <h4>Total Students</h4>
                    <div className="stat-value" style={{ color: '#10b981' }}>{Object.keys(students).length}</div>
                </div>
                <div className="stat-card">
                    <h4>Total Teachers</h4>
                    <div className="stat-value" style={{ color: '#f97316' }}>{Object.keys(teachers).length}</div>
                </div>
            </div>
            <div className="content-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link2 size={24} color="#0066ff" />
                    Matched Students & Teachers
                </h3>

                {matches.length === 0 ? (
                    <div className="empty-state">
                        <p>No matches yet.</p>
                        <Link to="/admin/match" className="btn-primary" style={{ marginTop: '1rem' }}>
                            Create First Match
                        </Link>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="matches-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Teacher</th>
                                    <th>Rate (₦/hr)</th>
                                    <th>Payment Method</th>
                                    <th>Payment Status</th>
                                    <th>Matched On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match) => {
                                    const paymentStatus = getPaymentStatus(match.studentId, match.teacherId);
                                    return (
                                        <tr key={match.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={16} color="#0066ff" />
                                                    <strong>{getStudentName(match.studentId)}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Briefcase size={16} color="#10b981" />
                                                    <strong>{getTeacherName(match.teacherId)}</strong>
                                                </div>
                                            </td>
                                            <td>₦{match.rate?.toLocaleString() || 0}</td>
                                            <td>
                                                <span className={`payment-badge ${match.paymentMethod}`}>
                                                    {match.paymentMethod === 'platform' ? 'Platform' : 'Direct'}
                                                </span>
                                            </td>
                                            <td>
                                                {paymentStatus.paid ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CheckCircle size={18} color="#10b981" />
                                                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                                                            Paid (₦{paymentStatus.amount?.toLocaleString()})
                                                        </span>
                                                    </div>
                                                ) : paymentStatus.pending ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Clock size={18} color="#f97316" />
                                                        <span style={{ color: '#f97316', fontWeight: '600' }}>
                                                            Pending Confirmation
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <XCircle size={18} color="#ef4444" />
                                                        <span style={{ color: '#ef4444', fontWeight: '600' }}>
                                                            Unpaid
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                                                    <Calendar size={14} />
                                                    {formatDate(match.createdAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
}

export default AdminDashboard;
