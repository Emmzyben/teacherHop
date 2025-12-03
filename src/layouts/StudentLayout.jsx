
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, CreditCard, MessageCircle } from 'lucide-react';

import { auth, onAuthStateChanged, ref, onValue, db } from '../lib/firebase';
import React, { useEffect, useState } from 'react';

function StudentLayout() {
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        // Fetch matches to find my teacher
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const allMatches = snap.exists() ? snap.val() : {};
            const myMatch = Object.values(allMatches).find(m => m.studentId === uid);

            if (myMatch) {
                const chatId = `${uid}_${myMatch.teacherId}`;
                const chatRef = ref(db, `chats/${chatId}`);

                onValue(chatRef, (chatSnap) => {
                    const chatData = chatSnap.exists() ? chatSnap.val() : {};
                    let unread = 0;

                    if (chatData && chatData.lastMessage) {
                        const lastMsg = chatData.lastMessage;
                        const myLastRead = chatData.participants?.[uid]?.lastRead || 0;

                        if (lastMsg.senderId !== uid && lastMsg.timestamp > myLastRead) {
                            unread = 1;
                        }
                    }
                    setUnreadChatCount(unread);
                });
            }
        });

        return () => {
            unsubMatches();
        };
    }, [uid]);
    return (
        <div className="dashboard-layout">
            <div className="container">
                <div className="dashboard-header">
                    <h2>Student Dashboard</h2>
                    <nav className="dashboard-nav">
                        <Link to="/student" className="btn-secondary">
                            <LayoutDashboard size={18} />
                            <span>Overview</span>
                        </Link>
                        <Link to="/student/profile" className="btn-secondary">
                            <User size={18} />
                            <span>My Profile</span>
                        </Link>
                        <Link to="/student/pay" className="btn-secondary">
                            <CreditCard size={18} />
                            <span>Pay for Lesson</span>
                        </Link>
                        <Link to="/student/chat" className="btn-secondary" style={{ position: 'relative' }}>
                            <MessageCircle size={18} />
                            <span>Chat</span>
                            {unreadChatCount > 0 && (
                                <span className="notification-badge">{unreadChatCount}</span>
                            )}
                        </Link>
                    </nav>
                </div>
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default StudentLayout;
