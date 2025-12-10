import React, { useEffect, useState } from 'react';
import { ref, onValue, push, set, get, update, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';

function AdminMatch() {
    const { showSuccess, showError, showWarning } = useNotification();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selStudent, setSelStudent] = useState('');
    const [selTeacher, setSelTeacher] = useState('');
    const [rate, setRate] = useState('');
    const [method, setMethod] = useState('platform');

    useEffect(() => {
        const unsubStudents = onValue(ref(db, 'students'), (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setStudents(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
        });

        const unsubTeachers = onValue(ref(db, 'teachers'), (snap) => {
            const val = snap.exists() ? snap.val() : {};
            setTeachers(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
        });

        return () => {
            unsubStudents();
            unsubTeachers();
        };
    }, []);

    async function match() {
        if (!selStudent || !selTeacher) {
            showWarning('Please select both student and teacher');
            return;
        }

        const teacher = teachers.find(t => t.id === selTeacher);
        if (!teacher) return;

        if ((teacher.slotsAvailable || 0) <= 0) {
            showError('This teacher has no available slots!');
            return;
        }

        const matchRef = push(ref(db, 'matches'));
        await set(matchRef, {
            teacherId: selTeacher,
            studentId: selStudent,
            rate: Number(rate) || 0,
            paymentMethod: method,
            createdAt: Date.now()
        });

        // Update teacher slots
        const tRef = ref(db, `teachers/${selTeacher}`);
        const tsnap = await get(tRef);
        const t = tsnap.exists() ? tsnap.val() : { slotsAvailable: 0, slotsUsed: 0 };

        await update(tRef, {
            slotsAvailable: Math.max((t.slotsAvailable || 0) - 1, 0),
            slotsUsed: (t.slotsUsed || 0) + 1
        });

        // Update student
        await update(ref(db, `students/${selStudent}`), {
            matchedTeacher: selTeacher
        });

        showSuccess('Student matched successfully!');
        setSelStudent('');
        setSelTeacher('');
        setRate('');
    }

    return (
        <div className="content-card">
            <h3>Match Student to Teacher</h3>
            <div className="form-group">
                <label>Select Student</label>
                <select value={selStudent} onChange={(e) => setSelStudent(e.target.value)}>
                    <option value="">-- Choose --</option>
                    {students.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.id})
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Select Teacher</label>
                <select value={selTeacher} onChange={(e) => {
                    const tid = e.target.value;
                    setSelTeacher(tid);
                    const t = teachers.find((teacher) => teacher.id === tid);
                    if (t) {
                        setRate(t.ratePerHour || '');
                        setMethod(t.paymentMethod || 'platform');
                    } else {
                        setRate('');
                        setMethod('platform');
                    }
                }}>
                    <option value="">-- Choose --</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name} — Slots: {t.slotsAvailable || 0}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Rate ($/hour)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="Optional"
                />
            </div>
            <div className="form-group">
                <label>Payment Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="platform">EnglishHop (15% fee)</option>
                    <option value="direct">Direct</option>
                </select>
            </div>
            <button onClick={match} className="btn-primary-full">Match Student</button>
        </div>
    );
}

export default AdminMatch;
