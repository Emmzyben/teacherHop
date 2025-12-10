import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, ref, push, set, get, update, db } from '../../lib/firebase';
import { useNotification } from '../../contexts/NotificationContext';

function BuySlots() {
    const { showSuccess, showError } = useNotification();
    const options = [
        { slots: 5, amount: 5 },
        { slots: 10, amount: 10 },
        { slots: 20, amount: 15 }
    ];
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return unsubscribe;
    }, []);

    async function buy(option) {
        if (!user) {
            showError('Please login first');
            return;
        }

        // Simulate payment
        const purchaseRef = push(ref(db, 'slotPurchases'));
        await set(purchaseRef, {
            teacherId: user.uid,
            slots: option.slots,
            amount: option.amount,
            timestamp: Date.now()
        });

        const teacherRef = ref(db, `teachers/${user.uid}`);
        const snap = await get(teacherRef);
        const current = snap.exists() ? snap.val() : { slotsAvailable: 0, slotsPurchased: 0 };

        await update(teacherRef, {
            slotsAvailable: (current.slotsAvailable || 0) + option.slots,
            slotsPurchased: (current.slotsPurchased || 0) + option.slots
        });

        showSuccess('Purchase successful! (Simulated)');
    }

    return (
        <div className="content-card">
            <h3>Buy Student Slots</h3>
            <div className="slot-options">
                {options.map((o) => (
                    <div key={o.slots} className="slot-option">
                        <div className="slot-info">
                            <strong>{o.slots} Slots</strong>
                            <span>${o.amount.toLocaleString()}</span>
                        </div>
                        <button onClick={() => buy(o)} className="btn-primary">Buy</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BuySlots;
