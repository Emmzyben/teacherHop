import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, update, onValue, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';
function SetRate() {
    const { showSuccess, showError } = useNotification();
    const [rate, setRate] = useState('');
    const [method, setMethod] = useState('direct');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNumber: ''
    });
    const [uid, setUid] = useState(null);

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
                                setBankDetails({ bankName: '', accountName: '', accountNumber: '' });
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

        await update(ref(db, `teachers/${uid}`), {
            ratePerHour: Number(rate),
            paymentMethod: method,
            bankDetails: method === 'direct' ? bankDetails : null
        });

        showSuccess('Settings saved successfully!');
    }

    return (
        <div className="content-card">
            <h3>Set Your Hourly Rate</h3>
            <div className="form-group">
                <label>Rate per hour (₦)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g. 5000"
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
                        <div style={{ marginLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Bank Account Details</label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                placeholder="Bank Name"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="text"
                                value={bankDetails.accountName}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                placeholder="Account Name"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                placeholder="Account Number"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
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
