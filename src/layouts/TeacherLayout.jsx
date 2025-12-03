import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, DollarSign, CreditCard, MessageCircle } from 'lucide-react';
import { auth, onAuthStateChanged, ref, onValue, db } from '../lib/firebase';

function TeacherLayout() {
    const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    const [unreadChatCount, setUnreadChatCount] = useState(0);

    useEffect(() => {
        if (!uid) return;

        // Fetch pending payments count
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const pendingCount = Object.values(all).filter(
                p => p.teacherId === uid && !p.confirmed && p.paymentMethod === 'direct'
            ).length;
            setPendingPaymentsCount(pendingCount);
        });

        // Fetch unread chats count
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const allMatches = snap.exists() ? snap.val() : {};
            const teacherMatches = Object.values(allMatches).filter(m => m.teacherId === uid);

            // For each match, check the chat status
            // We need to listen to the 'chats' node or individual chat nodes
            // For simplicity, let's listen to the whole 'chats' node but filter by our IDs
            // A better approach for scale would be individual listeners, but this works for now
            const chatsRef = ref(db, 'chats');
            onValue(chatsRef, (chatSnap) => {
                const allChats = chatSnap.exists() ? chatSnap.val() : {};
                let unread = 0;

                teacherMatches.forEach(match => {
                    const chatId = `${match.studentId}_${uid}`;
                    const chatData = allChats[chatId];

                    if (chatData && chatData.lastMessage) {
                        const lastMsg = chatData.lastMessage;
                        const myLastRead = chatData.participants?.[uid]?.lastRead || 0;

                        if (lastMsg.senderId !== uid && lastMsg.timestamp > myLastRead) {
                            unread++;
                        }
                    }
                });
                setUnreadChatCount(unread);
            });
        });

        return () => {
            unsubPayments();
            unsubMatches();
        };
    }, [uid]);

    return (
        <div className="dashboard-layout">
            <div className="container">
                <div className="dashboard-header">
                    <h2>Teacher Dashboard</h2>
                    <nav className="dashboard-nav">
                        <Link to="/teacher" className="btn-secondary">
                            <LayoutDashboard size={18} />
                            <span>Overview</span>
                        </Link>
                        <Link to="/teacher/buy-slots" className="btn-secondary">
                            <ShoppingCart size={18} />
                            <span>Buy Slots</span>
                        </Link>
                        <Link to="/teacher/students" className="btn-secondary">
                            <Users size={18} />
                            <span>My Students</span>
                        </Link>
                        <Link to="/teacher/payments" className="btn-secondary" style={{ position: 'relative' }}>
                            <CreditCard size={18} />
                            <span>Payments</span>
                            {pendingPaymentsCount > 0 && (
                                <span className="notification-badge">{pendingPaymentsCount}</span>
                            )}
                        </Link>
                        <Link to="/teacher/chat" className="btn-secondary" style={{ position: 'relative' }}>
                            <MessageCircle size={18} />
                            <span>Chat</span>
                            {unreadChatCount > 0 && (
                                <span className="notification-badge">{unreadChatCount}</span>
                            )}
                        </Link>
                        <Link to="/teacher/rate" className="btn-secondary">
                            <DollarSign size={18} />
                            <span>Set Rate</span>
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

export default TeacherLayout;
