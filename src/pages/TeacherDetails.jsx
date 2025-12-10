import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, db, auth, onAuthStateChanged, push, set, get, update } from '../lib/firebase';
import { useNotification } from '../contexts/NotificationContext';
import {
    ArrowLeft,
    DollarSign,
    Users,
    BookOpen,
    Clock,
    Award,
    CheckCircle,
    Video,
    MapPin,
    Phone,
    Mail,
    GraduationCap,
    Star
} from 'lucide-react';

function TeacherDetails() {
    const { teacherId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning } = useNotification();

    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [matching, setMatching] = useState(false);
    const [alreadyMatched, setAlreadyMatched] = useState(false);

    // Get current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);

                // Get user role
                const roleSnap = await get(ref(db, `users/${user.uid}/role`));
                if (roleSnap.exists()) {
                    setUserRole(roleSnap.val());
                }

                // Check if already matched
                const matchesSnap = await get(ref(db, 'matches'));
                if (matchesSnap.exists()) {
                    const matches = matchesSnap.val();
                    const existingMatch = Object.values(matches).find(
                        m => m.studentId === user.uid
                    );
                    setAlreadyMatched(!!existingMatch);
                }
            }
        });

        return unsubscribe;
    }, []);

    // Get teacher details
    useEffect(() => {
        if (!teacherId) {
            setLoading(false);
            return;
        }

        // Set a timeout to stop loading after 5 seconds if Firebase doesn't respond
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onValue(ref(db, `teachers/${teacherId}`), (snap) => {
            clearTimeout(timeout);
            if (snap.exists()) {
                setTeacher({ id: teacherId, ...snap.val() });
            }
            setLoading(false);
        }, (error) => {
            clearTimeout(timeout);
            console.error('Error fetching teacher:', error);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, [teacherId]);

    const handleChooseTeacher = async () => {
        if (!currentUser) {
            showWarning('Please login as a student to choose a teacher');
            navigate('/login');
            return;
        }

        if (userRole !== 'student') {
            showError('Only students can choose teachers');
            return;
        }

        if (alreadyMatched) {
            showWarning('You are already matched with a teacher');
            return;
        }

        // Check if teacher has set their rate
        if (!teacher.ratePerHour || teacher.ratePerHour === 0) {
            showError('This teacher has not set their hourly rate yet. Please choose another teacher.');
            return;
        }

        // Check if teacher using direct payment has bank details
        if (teacher.paymentMethod === 'direct') {
            if (!teacher.bankDetails ||
                !teacher.bankDetails.bankName ||
                !teacher.bankDetails.accountNumber ||
                !teacher.bankDetails.accountName) {
                showError('This teacher has not completed their bank details setup. Please choose another teacher or contact support.');
                return;
            }
        }

        if ((teacher.slotsAvailable || 0) <= 0) {
            showError('This teacher has no available slots!');
            return;
        }

        setMatching(true);

        try {
            console.log('Starting match process...', {
                teacherId,
                studentId: currentUser.uid,
                teacher
            });

            // Create match
            const matchRef = push(ref(db, 'matches'));
            const matchData = {
                teacherId: teacherId,
                studentId: currentUser.uid,
                teacherName: teacher.name || 'Teacher',
                studentName: currentUser.email?.split('@')[0] || 'Student',
                rate: Number(teacher.ratePerHour) || 0,
                paymentMethod: teacher.paymentMethod || 'platform',
                status: 'active',
                createdAt: Date.now()
            };

            console.log('Creating match with data:', matchData);
            await set(matchRef, matchData);
            console.log('Match created successfully');

            // Update teacher slots
            const tRef = ref(db, `teachers/${teacherId}`);
            const tsnap = await get(tRef);

            if (!tsnap.exists()) {
                throw new Error('Teacher data not found');
            }

            const t = tsnap.val();
            const newSlotsAvailable = Math.max((t.slotsAvailable || 0) - 1, 0);
            const newSlotsUsed = (t.slotsUsed || 0) + 1;

            console.log('Updating teacher slots:', {
                current: t.slotsAvailable,
                new: newSlotsAvailable
            });

            await update(tRef, {
                slotsAvailable: newSlotsAvailable,
                slotsUsed: newSlotsUsed
            });
            console.log('Teacher slots updated');

            // Update student
            const studentRef = ref(db, `students/${currentUser.uid}`);
            const studentSnap = await get(studentRef);

            if (!studentSnap.exists()) {
                // Create student record if it doesn't exist
                await set(studentRef, {
                    email: currentUser.email,
                    name: currentUser.email?.split('@')[0] || 'Student',
                    matchedTeacher: teacherId,
                    createdAt: Date.now()
                });
            } else {
                await update(studentRef, {
                    matchedTeacher: teacherId
                });
            }
            console.log('Student record updated');

            showSuccess('Successfully matched with teacher! Redirecting to your dashboard...');

            setTimeout(() => {
                navigate('/student');
            }, 2000);

        } catch (error) {
            console.error('Error matching:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            showError(`Failed to match with teacher: ${error.message || 'Please try again.'}`);
            setMatching(false);
        }
    };

    // Check if teacher profile is complete for matching
    const isProfileIncomplete = () => {
        if (!teacher) return false;

        // Check if rate is set
        if (!teacher.ratePerHour || teacher.ratePerHour === 0) {
            return 'rate';
        }

        // Check bank details if using direct payment
        if (teacher.paymentMethod === 'direct') {
            if (!teacher.bankDetails ||
                !teacher.bankDetails.bankName ||
                !teacher.bankDetails.accountNumber ||
                !teacher.bankDetails.accountName) {
                return 'bank';
            }
        }

        return false;
    };

    const profileIssue = isProfileIncomplete();
    const canMatch = !profileIssue && (teacher?.slotsAvailable || 0) > 0 && !alreadyMatched;

    if (loading) {
        return (
            <div className="page-content">
                <div className="container">
                    <div className="loading">Loading teacher details...</div>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="page-content">
                <div className="container">
                    <div className="empty-state">Teacher not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-details-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} />
                    Back to Teachers
                </button>

                <div className="teacher-details-container">
                    {/* Main Profile Card */}
                    <div className="teacher-profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar-large">
                                {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div className="profile-header-info">
                                <h1>{teacher.name || 'Teacher'}</h1>
                                <p className="teacher-title">{teacher.title || 'English Teacher'}</p>
                                <div className="availability-status">
                                    {(teacher.slotsAvailable || 0) > 0 ? (
                                        <span className="status-available">
                                            <CheckCircle size={16} />
                                            Available for new students
                                        </span>
                                    ) : (
                                        <span className="status-unavailable">
                                            Currently unavailable
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="profile-stats">
                            <div className="stat-box">
                                <div className="stat-icon blue">
                                    <DollarSign size={20} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Rate</span>
                                    <span className="stat-value">${teacher.ratePerHour || 0}/hr</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon green">
                                    <Users size={20} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Available Slots</span>
                                    <span className="stat-value">{teacher.slotsAvailable || 0}</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon purple">
                                    <Award size={20} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Experience</span>
                                    <span className="stat-value">{teacher.experience || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="profile-section">
                            <h3>About Me</h3>
                            <p className="teacher-bio-full">
                                {teacher.bio || 'Experienced English teacher dedicated to helping students achieve their language learning goals.'}
                            </p>
                        </div>


                        {/* Qualifications */}
                        {teacher.qualifications && teacher.qualifications.trim() !== '' && (
                            <div className="profile-section">
                                <h3>
                                    <GraduationCap size={20} />
                                    Qualifications & Certifications
                                </h3>
                                <p className="teacher-info-text">
                                    {teacher.qualifications}
                                </p>
                            </div>
                        )}

                        {/* Specializations */}
                        {teacher.specializations && teacher.specializations.trim() !== '' && (
                            <div className="profile-section">
                                <h3>
                                    <Star size={20} />
                                    Specializations
                                </h3>
                                <p className="teacher-info-text">
                                    {teacher.specializations}
                                </p>
                            </div>
                        )}

                        {/* Subjects */}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                            <div className="profile-section">
                                <h3>
                                    <BookOpen size={20} />
                                    Subjects I Teach
                                </h3>
                                <div className="subjects-list">
                                    {teacher.subjects.map((subject, idx) => (
                                        <span key={idx} className="subject-badge">
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Intro Video */}
                        {teacher.introVideo && (
                            <div className="profile-section">
                                <h3>
                                    <Video size={20} />
                                    Introduction Video
                                </h3>
                                <div className="video-container">
                                    <video controls className="intro-video">
                                        <source src={teacher.introVideo} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}

                        {/* Availability */}
                        {teacher.availability && (
                            <div className="profile-section">
                                <h3>
                                    <Clock size={20} />
                                    Availability
                                </h3>
                                <p>{teacher.availability}</p>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="profile-section">
                            <h3>Payment Method</h3>
                            <p>
                                {teacher.paymentMethod === 'platform'
                                    ? 'EnglishHop Platform (15% fee)'
                                    : 'Direct Payment'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar - Action Card */}
                    <div className="teacher-action-card">
                        <div className="action-card-content">
                            <h3>Ready to Start Learning?</h3>
                            <p>Choose this teacher to begin your English learning journey</p>

                            <div className="action-price">
                                <span className="price-label">Hourly Rate</span>
                                <span className="price-value">${teacher.ratePerHour || 0}</span>
                            </div>

                            {/* Profile Incomplete Warning */}
                            {profileIssue && (
                                <div style={{
                                    background: '#fef2f2',
                                    border: '2px solid #ef4444',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{
                                        color: '#991b1b',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        ⚠️ Profile Incomplete
                                    </p>
                                    <p style={{
                                        color: '#7f1d1d',
                                        fontSize: '0.85rem',
                                        margin: '0.5rem 0 0 0'
                                    }}>
                                        {profileIssue === 'rate'
                                            ? 'This teacher has not set their hourly rate yet.'
                                            : 'This teacher has not completed their bank details setup.'}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleChooseTeacher}
                                disabled={matching || !canMatch}
                                className="btn-primary-full choose-teacher-btn"
                                style={{
                                    opacity: !canMatch ? 0.6 : 1,
                                    cursor: !canMatch ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {matching ? 'Matching...' :
                                    alreadyMatched ? 'Already Matched' :
                                        profileIssue ? 'Profile Incomplete' :
                                            (teacher.slotsAvailable || 0) <= 0 ? 'No Slots Available' :
                                                'Choose This Teacher'}
                            </button>

                            {!currentUser && (
                                <p className="action-note">
                                    Please <a href="/login">login</a> as a student to choose this teacher
                                </p>
                            )}

                            {alreadyMatched && (
                                <p className="action-note warning">
                                    You are already matched with a teacher. Visit your dashboard to manage your current match.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherDetails;
