import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged, ref, get, child, db } from '../lib/firebase';

function Protected({ children, role }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (!u) {
                navigate('/login');
                return;
            }

            let detectedRole = null;

            // Check Admin (users table with role field)
            const adminSnap = await get(ref(db, `users/${u.uid}`));
            if (adminSnap.exists() && adminSnap.val().role === 'admin') {
                detectedRole = 'admin';
            }

            // Check Teacher
            if (!detectedRole) {
                const teacherSnap = await get(ref(db, `teachers/${u.uid}`));
                if (teacherSnap.exists()) {
                    detectedRole = 'teacher';
                }
            }

            // Check Student
            if (!detectedRole) {
                const studentSnap = await get(ref(db, `students/${u.uid}`));
                if (studentSnap.exists()) {
                    detectedRole = 'student';
                }
            }

            // If a specific role is required and doesn't match, redirect to home
            if (role && detectedRole !== role) {
                navigate('/');
                return;
            }

            setUser(u);
            setUserRole(detectedRole);
            setLoading(false);
        });

        return unsubscribe;
    }, [navigate, role]);

    if (loading) return <div className="loading">Loading...</div>;
    return children;
}

export default Protected;
