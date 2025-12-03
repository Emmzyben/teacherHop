import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, onValue, db } from '../../lib/firebase';
import Chat from '../../components/Chat';
import { MessageCircle } from 'lucide-react';

function StudentChat() {
    const [uid, setUid] = useState(null);
    const [match, setMatch] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUid(u.uid);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!uid) return;

        // Fetch match
        const matchesRef = ref(db, 'matches');
        const unsubMatches = onValue(matchesRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const found = Object.values(all).find((m) => m.studentId === uid);
            setMatch(found);
        });

        // Fetch payment
        const paymentsRef = ref(db, 'payments');
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const all = snap.exists() ? snap.val() : {};
            const found = Object.values(all).find(p => p.studentId === uid && p.confirmed);
            setPayment(found);
        });

        return () => {
            unsubMatches();
            unsubPayments();
        };
    }, [uid]);

    useEffect(() => {
        if (match?.teacherId) {
            const teacherRef = ref(db, `teachers/${match.teacherId}`);
            onValue(teacherRef, (snap) => {
                setTeacher(snap.val());
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [match]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!match) {
        return (
            <div className="content-card">
                <h3>Chat</h3>
                <div className="empty-state">
                    <MessageCircle size={48} color="#ccc" />
                    <p>You need to be matched with a teacher first.</p>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="content-card">
                <h3>Chat</h3>
                <div className="empty-state">
                    <MessageCircle size={48} color="#ccc" />
                    <p>Chat will be available after payment is confirmed.</p>
                </div>
            </div>
        );
    }

    const chatId = `${match.studentId}_${match.teacherId}`;

    return (
        <div className="content-card">
            <Chat
                currentUserId={uid}
                otherUserId={match.teacherId}
                otherUserName={teacher?.name || 'Teacher'}
                chatId={chatId}
            />
        </div>
    );
}

export default StudentChat;
