import React, { useEffect, useState, useRef } from 'react';
import { ref, onValue, push, set, db } from '../lib/firebase';
import { Send, MessageCircle } from 'lucide-react';

function Chat({ currentUserId, otherUserId, otherUserName, chatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }

        const messagesRef = ref(db, `chats/${chatId}/messages`);
        const unsubscribe = onValue(messagesRef, (snap) => {
            const val = snap.exists() ? snap.val() : {};
            const messagesList = Object.keys(val)
                .map((k) => ({ id: k, ...val[k] }))
                .sort((a, b) => a.timestamp - b.timestamp);
            setMessages(messagesList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [chatId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!chatId || !currentUserId) return;

        // Update lastRead when entering chat or when new messages arrive
        const updateLastRead = async () => {
            const lastReadRef = ref(db, `chats/${chatId}/participants/${currentUserId}/lastRead`);
            await set(lastReadRef, Date.now());
        };

        if (messages.length > 0) {
            updateLastRead();
        }
    }, [chatId, currentUserId, messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageRef = push(ref(db, `chats/${chatId}/messages`));
        const timestamp = Date.now();

        await set(messageRef, {
            senderId: currentUserId,
            text: newMessage.trim(),
            timestamp: timestamp
        });

        // Update chat metadata
        await set(ref(db, `chats/${chatId}/lastMessage`), {
            text: newMessage.trim(),
            timestamp: timestamp,
            senderId: currentUserId
        });

        // Update sender's last read as well
        await set(ref(db, `chats/${chatId}/participants/${currentUserId}/lastRead`), timestamp);

        setNewMessage('');
    };

    if (loading) {
        return <div className="loading">Loading chat...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <MessageCircle size={20} color="#0066ff" />
                <h4>Chat with {otherUserName}</h4>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                        >
                            <div className="message-bubble">
                                <p>{msg.text}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()} style={{ width: 'auto', padding: '0 15px' }}>
                    <Send size={18} />
                    <span style={{ marginLeft: '6px', fontWeight: '600' }}>Send</span>
                </button>
            </form>
        </div>
    );
}

export default Chat;
