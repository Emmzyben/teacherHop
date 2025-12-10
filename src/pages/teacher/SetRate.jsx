import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, update, onValue, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

function SetRate() {
    const { showSuccess, showError } = useNotification();
    const [rate, setRate] = useState('');
    const [method, setMethod] = useState('direct');
    const [bankDetails, setBankDetails] = useState(null);
    const [uid, setUid] = useState(null);

    const hasBankDetails = bankDetails &&
        bankDetails.bankName &&
        bankDetails.accountNumber &&
        bankDetails.accountName;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUid(u.uid);
                // Fetch existing settings
                onValue(ref(db, `teachers/${u.uid}`), (snap) => {
                    const data = snap.val();
                    if (data) {
                        if (data.ratePerHour) setRate(data.ratePerHour);
                        if (data.paymentMethod) setMethod(data.paymentMethod);
                        if (data.bankDetails) {
                            // Handle if it was previously a string
                            if (typeof data.bankDetails === 'string') {
                                setBankDetails(null);
                            } else {
                                setBankDetails(data.bankDetails);
                            }
                        }
                    }
                });
            }
        });
        return unsubscribe;
    }, []);

    async function save() {
        if (!uid) {
            showError('Please login');
            return;
        }

        // Validate bank details if direct payment is selected
        if (method === 'direct' && !hasBankDetails) {
            showError('Please set up your bank details in your profile first');
            return;
        }

        await update(ref(db, `teachers/${uid}`), {
            ratePerHour: Number(rate),
            paymentMethod: method
        });

        showSuccess('Settings saved successfully!');
    }

    return (
        <div className="content-card">
            <h3>Set Your Hourly Rate</h3>
            <div className="form-group">
                <label>Rate per hour ($)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g. 10"
                />
            </div>
            <div className="form-group">
                <label>Payment Method</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="pm"
                            checked={method === 'direct'}
                            onChange={() => setMethod('direct')}
                        />
                        Direct Payment
                    </label>

                    {method === 'direct' && (
                        <div style={{
                            marginLeft: '20px',
                            marginTop: '10px',
                            padding: '1rem',
                            borderRadius: '8px',
                            background: hasBankDetails ? '#ecfdf5' : '#fef2f2',
                            border: `2px solid ${hasBankDetails ? '#10b981' : '#ef4444'}`
                        }}>
                            {hasBankDetails ? (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                        color: '#10b981',
                                        fontWeight: '600'
                                    }}>
                                        <CheckCircle size={20} />
                                        <span>Bank Details Configured</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        color: '#666',
                                        fontSize: '0.9rem'
                                    }}>
                                        <CreditCard size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <div><strong>Bank:</strong> {bankDetails.bankName}</div>
                                            <div><strong>Account Name:</strong> {bankDetails.accountName}</div>
                                            <div><strong>Account Number:</strong> {bankDetails.accountNumber}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '0.85rem',
                                        color: '#666'
                                    }}>
                                        <Link
                                            to="/teacher/profile"
                                            style={{
                                                color: '#0066ff',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Update bank details in your profile
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                        color: '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        <AlertTriangle size={20} />
                                        <span>Bank Details Required</span>
                                    </div>
                                    <p style={{
                                        margin: '0 0 12px 0',
                                        color: '#666',
                                        fontSize: '0.9rem'
                                    }}>
                                        To use direct payment, you need to set up your bank account details first.
                                        Students will use these details to transfer payments directly to you.
                                    </p>
                                    <Link
                                        to="/teacher/profile"
                                        className="btn-primary-small"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '8px'
                                        }}
                                    >
                                        <CreditCard size={16} />
                                        Set Up Bank Details
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    <label className="radio-label">
                        <input
                            type="radio"
                            name="pm"
                            checked={method === 'platform'}
                            onChange={() => setMethod('platform')}
                        />
                        EnglishHop Payment (15% fee)
                    </label>
                </div>
            </div>
            <button onClick={save} className="btn-primary-full">Save Settings</button>
        </div>
    );
}

export default SetRate;
