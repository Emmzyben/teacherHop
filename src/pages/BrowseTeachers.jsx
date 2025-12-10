import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, db } from '../lib/firebase';
import { Users, Star, DollarSign, BookOpen } from 'lucide-react';

function BrowseTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Set a timeout to stop loading after 5 seconds if Firebase doesn't respond
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onValue(ref(db, 'teachers'), (snap) => {
            clearTimeout(timeout);
            const val = snap.exists() ? snap.val() : {};
            const teacherList = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
            setTeachers(teacherList);
            setLoading(false);
        }, (error) => {
            clearTimeout(timeout);
            console.error('Error fetching teachers:', error);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const filteredTeachers = teachers.filter(teacher => {
        if (filter === 'available') {
            return (teacher.slotsAvailable || 0) > 0;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="page-content">
                <div className="container">
                    <div className="loading">Loading teachers...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="browse-teachers-page">
            {/* Hero Section */}
            <section className="browse-hero">
                <div className="container">
                    <h1>Find Your Perfect English Teacher</h1>
                    <p className="hero-subtitle">
                        Browse our verified English tutors and choose the one that fits your learning goals
                    </p>

                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Teachers ({teachers.length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'available' ? 'active' : ''}`}
                            onClick={() => setFilter('available')}
                        >
                            Available Now ({teachers.filter(t => (t.slotsAvailable || 0) > 0).length})
                        </button>
                    </div>
                </div>
            </section>

            {/* Teachers Grid */}
            <section className="section-padded">
                <div className="container">
                    {filteredTeachers.length === 0 ? (
                        <div className="empty-state">
                            No teachers found matching your criteria
                        </div>
                    ) : (
                        <div className="teachers-grid">
                            {filteredTeachers.map((teacher) => (
                                <Link
                                    to={`/teacher-profile/${teacher.id}`}
                                    key={teacher.id}
                                    className="teacher-card"
                                >
                                    <div className="teacher-card-header">
                                        <div className="teacher-avatar">
                                            {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                                        </div>
                                        {(teacher.slotsAvailable || 0) > 0 && (
                                            <span className="availability-badge">Available</span>
                                        )}
                                    </div>

                                    <div className="teacher-card-body">
                                        <h3>{teacher.name || 'Teacher'}</h3>
                                        <p className="teacher-bio">
                                            {teacher.bio || 'Experienced English teacher ready to help you achieve your goals'}
                                        </p>

                                        <div className="teacher-meta">
                                            <div className="meta-item">
                                                <DollarSign size={16} />
                                                <span>${teacher.ratePerHour || 0}/hr</span>
                                            </div>
                                            <div className="meta-item">
                                                <Users size={16} />
                                                <span>{teacher.slotsAvailable || 0} slots</span>
                                            </div>
                                            <div className="meta-item">
                                                <BookOpen size={16} />
                                                <span>{teacher.experience || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {teacher.subjects && teacher.subjects.length > 0 && (
                                            <div className="teacher-subjects">
                                                {teacher.subjects.slice(0, 3).map((subject, idx) => (
                                                    <span key={idx} className="subject-tag">
                                                        {subject}
                                                    </span>
                                                ))}
                                                {teacher.subjects.length > 3 && (
                                                    <span className="subject-tag">+{teacher.subjects.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="teacher-card-footer">
                                        <span className="view-profile-btn">View Profile →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default BrowseTeachers;
