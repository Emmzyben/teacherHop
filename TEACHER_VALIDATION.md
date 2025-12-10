# Teacher Profile Validation for Matching

## Overview
Added comprehensive validation to prevent students from matching with teachers who have incomplete payment setup. Ensures all teachers have set their hourly rate and (if using direct payment) completed their bank details before accepting students.

## Validation Rules

### 🚫 Students Cannot Match If:

1. **No Hourly Rate Set**
   - Teacher has `ratePerHour` as `null`, `undefined`, or `0`
   - Error: "This teacher has not set their hourly rate yet. Please choose another teacher."

2. **Missing Bank Details (Direct Payment)**
   - Teacher selected `paymentMethod: 'direct'`
   - BUT missing any of:
     - `bankDetails.bankName`
     - `bankDetails.accountNumber`
     - `bankDetails.accountName`
   - Error: "This teacher has not completed their bank details setup. Please choose another teacher or contact support."

3. **No Available Slots**
   - `slotsAvailable <= 0`
   - Error: "This teacher has no available slots!"

4. **Already Matched**
   - Student already has an active match
   - Warning: "You are already matched with a teacher"

## Implementation

### Validation in `handleChooseTeacher`

```javascript
const handleChooseTeacher = async () => {
    // ... authentication checks ...

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

    // ... slots check and matching logic ...
};
```

### Profile Completeness Helper

```javascript
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
```

## UI Changes

### Warning Box Display

When teacher profile is incomplete, a red warning box shows:

```
┌─────────────────────────────────────────┐
│ ⚠️ Profile Incomplete                   │
│                                         │
│ This teacher has not set their hourly   │
│ rate yet.                               │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: Light red (#fef2f2)
- Border: Red (#ef4444)
- Text: Dark red for emphasis
- Positioned above the "Choose Teacher" button

### Button States

**Button Text Changes:**
- ✅ Normal: "Choose This Teacher"
- ⚠️ Profile Incomplete: "Profile Incomplete"
- ⏸️ No Slots: "No Slots Available"
- ✓ Already Matched: "Already Matched"
- ⌛ Matching: "Matching..."

**Button Styling:**
- Disabled when profile incomplete
- Reduced opacity (0.6)
- Not-allowed cursor
- Can't be clicked

## Validation Flow

### Scenario 1: Teacher Without Rate

```
Student clicks "Browse Teachers"
  ↓
Views teacher profile
  ↓
Red warning: "Profile Incomplete - No hourly rate set"
  ↓
Button disabled: "Profile Incomplete"
  ↓
Student CANNOT match
```

### Scenario 2: Teacher with Direct Payment, No Bank Details

```
Student views teacher profile
  ↓
Teacher uses "Direct Payment"
  ↓
Bank details incomplete
  ↓
Red warning: "Profile Incomplete - Bank details not set up"
  ↓
Button disabled: "Profile Incomplete"
  ↓
Student CANNOT match
```

### Scenario 3: Complete Profile

```
Student views teacher profile
  ↓
✓ Rate is set
  ↓
✓ Bank details complete (if direct payment)
  ↓
✓ Slots available
  ↓
No warning shown
  ↓
Button enabled: "Choose This Teacher"
  ↓
Student CAN match ✅
```

## Error Messages

### Frontend (UI)
| Issue | Message |
|-------|---------|
| No Rate | "This teacher has not set their hourly rate yet. Please choose another teacher." |
| Missing Bank Details | "This teacher has not completed their bank details setup. Please choose another teacher or contact support." |
| No Slots | "This teacher has no available slots!" |
| Already Matched | "You are already matched with a teacher" |

### Toast Notifications
All error messages appear as toast notifications using the `showError()` function, providing clear feedback to students.

## Benefits

### For Students:
1. ✅ **Protected from incomplete profiles** - Can't match with unprepared teachers
2. ✅ **Clear communication** - Know exactly why matching is blocked
3. ✅ **No payment issues** - Guaranteed teacher can accept payment
4. ✅ **Better experience** - Only match with fully set-up teachers

### For Teachers:
1. 📋 **Clear requirements** - Know what must be completed
2. 💰 **Payment ready** - Must set up payment before accepting students
3. 🎯 **Professional standard** - Maintains quality on platform
4. ⚡ **Automatic enforcement** - System prevents incomplete profiles

### For Platform:
1. 🔒 **Data integrity** - All matches have valid payment info
2. 💳 **Payment processing** - No failed payments due to missing info
3. 📊 **Quality control** - Only complete profiles can accept students
4. ⚖️ **Fair marketplace** - All teachers meet same standards

## Validation Order

Checks performed in this order:

1. ✅ User authenticated?
2. ✅ User is student role?
3. ✅ Student not already matched?
4. 🆕 **Teacher has rate set?**
5. 🆕 **Teacher has bank details? (if direct payment)**
6. ✅ Teacher has available slots?
7. ➡️ Proceed with matching

## Platform Payment Methods

### Platform Payment (`paymentMethod: 'platform'`)
**Requirements:**
- ✅ Hourly rate must be set
- ❌ Bank details NOT required (platform handles payment)

**Validation:**
- Only checks if `ratePerHour` is set

### Direct Payment (`paymentMethod: 'direct'`)
**Requirements:**
- ✅ Hourly rate must be set
- ✅ Bank details MUST be complete:
  - Bank name
  - Account number
  - Account name

**Validation:**
- Checks `ratePerHour`
- Checks all bank detail fields

## Edge Cases Handled

### 1. Rate is 0
```javascript
if (!teacher.ratePerHour || teacher.ratePerHour === 0) {
    // Blocked - even 0 is invalid
}
```

### 2. Platform Payment (No Bank Check)
```javascript
if (teacher.paymentMethod === 'platform') {
    // Bank details check skipped
    // Only rate is required
}
```

### 3. Null vs Empty String
```javascript
if (!teacher.bankDetails?.bankName) {
    // Handles null, undefined, empty string
}
```

### 4. Missing Payment Method
```javascript
// If paymentMethod undefined, defaults to requiring bank details
if (teacher.paymentMethod === 'direct') {
    // Check bank details
}
```

## Testing Scenarios

| Scenario | Rate | Payment Method | Bank Details | Can Match? |
|----------|------|----------------|--------------|------------|
| Complete profile | $25 | Platform | N/A | ✅ Yes |
| Complete profile | $30 | Direct | Complete | ✅ Yes |
| No rate | $0 | Platform | N/A | ❌ No |
| No rate | Not set | Direct | Complete | ❌ No |
| Direct, no bank | $20 | Direct | Incomplete | ❌ No |
| Direct, no bank | $15 | Direct | Missing | ❌ No |

## Related Components

- **TeacherDetails.jsx**: Main validation logic
- **TeacherProfile.jsx**: Where teachers set rate and bank details
- **SetRate.jsx**: Where teachers configure payment method
- **StudentPay.jsx**: Where bank details are used for payment

## Future Enhancements

Possible improvements:
1. **Email notification** - Alert teacher when profile incomplete blocks students
2. **Dashboard alert** - Show teachers they need to complete profile
3. **Progress indicator** - Show profile completion percentage
4. **Soft matching** - Allow matching with follow-up to complete details
5. **Admin override** - Allow admins to manually match despite incomplete profile
6. **Grace period** - Allow teachers X days to complete after initial signup
