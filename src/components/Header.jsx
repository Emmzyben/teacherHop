import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, onAuthStateChanged, signOut, get, ref, db } from '../lib/firebase';
import { Menu, X } from 'lucide-react';

function Header() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                // Check Admin
                const adminRef = ref(db, `users/${u.uid}`);
                const adminSnap = await get(adminRef);
                if (adminSnap.exists() && adminSnap.val().role === 'admin') {
                    setRole('admin');
                    return;
                }

                // Check Teacher
                const teacherRef = ref(db, `teachers/${u.uid}`);
                const teacherSnap = await get(teacherRef);
                if (teacherSnap.exists()) {
                    setRole('teacher');
                    return;
                }

                // Check Student
                const studentRef = ref(db, `students/${u.uid}`);
                const studentSnap = await get(studentRef);
                if (studentSnap.exists()) {
                    setRole('student');
                    return;
                }

                setRole(null);
            } else {
                setRole(null);
            }
        });
        return unsubscribe;
    }, []);

    const getDashboardLink = () => {
        if (role === 'admin') return '/admin';
        if (role === 'teacher') return '/teacher';
        if (role === 'student') return '/student';
        return '/';
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <header className="app-header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <div className="logo-icon">E</div>
                        <span className="logo-text">EnglishHop</span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Navigation */}
                    <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
                        <Link to="/" onClick={closeMobileMenu}>Home</Link>
                        <Link to="/browse-teachers" onClick={closeMobileMenu}>Browse Teachers</Link>
                        {user && role && (
                            <Link to={getDashboardLink()} onClick={closeMobileMenu}>Dashboard</Link>
                        )}
                        {!user && (
                            <>
                                <Link to="/login" onClick={closeMobileMenu}>Login</Link>
                                <Link to="/register" className="btn-primary-small" onClick={closeMobileMenu}>Register</Link>
                            </>
                        )}
                        {user && (
                            <button onClick={() => { signOut(auth); closeMobileMenu(); }} className="btn-secondary-small">Logout</button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
