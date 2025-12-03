import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import '../styles/notification.css';

const Notification = ({ message, type = 'info', onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div className={`notification notification-${type} ${isExiting ? 'notification-exit' : ''}`}>
            <div className="notification-icon">
                {icons[type]}
            </div>
            <div className="notification-message">
                {message}
            </div>
            <button className="notification-close" onClick={handleClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Notification;
