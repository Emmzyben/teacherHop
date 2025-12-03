import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';

function StudentDashboard() {
    const [match, setMatch] = useState(null);
    const [uid, setUid] = useState(null);

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

    return (
        <div className="content-card">
            {match ? (
                <div>
                    <h4>Your Matched Teacher</h4>
                    <p><strong>Teacher ID:</strong> {match.teacherId}</p>
                    <p><strong>Rate:</strong> ₦{match.rate}/hr</p>
                    <p><strong>Payment Method:</strong> {match.paymentMethod}</p>
                    <div style={{ marginTop: '20px' }}>
                        <Link to="/student/pay" className="btn-primary">Pay for Lesson</Link>
                    </div>
                </div>
            ) : (
                <div className="empty-state">No teacher matched yet.</div>
            )}
        </div>
    );
}

export default StudentDashboard;
