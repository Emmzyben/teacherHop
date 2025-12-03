import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';

function TeacherStudents() {
    const [students, setStudents] = useState([]);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        const q = ref(db, 'matches');
        const unsubscribe = onValue(q, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const arr = Object.keys(all)
                .filter((k) => all[k].teacherId === uid)
                .map((k) => ({ id: k, ...all[k] }));
            setStudents(arr);
        });

        return unsubscribe;
    }, [uid]);

    return (
        <div className="content-card">
            <h3>My Students</h3>
            {students.length === 0 && <div className="empty-state">No matched students yet.</div>}
            {students.map((s) => (
                <div key={s.id} className="list-item">
                    <div>
                        <strong>Student: {s.studentId}</strong>
                        <p>Rate: ₦{s.rate} — Payment: {s.paymentMethod}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TeacherStudents;
