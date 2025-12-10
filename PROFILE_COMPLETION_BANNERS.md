# Profile Completion Banners

## Overview
Added prominent profile completion banners to both teacher and student dashboards that detect incomplete profiles and prompt users to complete missing information.

## Implementation

### 🎓 Teacher Dashboard Banner

#### Checks for Missing:
1. **Name** - Full name not set or empty
2. **Bio** - About me section not filled
3. **Qualifications** - Teaching qualifications not provided
4. **Hourly Rate** - Rate per hour not set or is zero
5. **Bank Details** (if using direct payment) - Bank name, account number, or account name missing

#### Logic:
```javascript
const isProfileIncomplete = () => {
    if (!teacher) return false;
    
    const missingFields = [];
    
    if (!teacher.name || teacher.name.trim() === '') missingFields.push('Name');
    if (!teacher.bio || teacher.bio.trim() === '') missingFields.push('Bio');
    if (!teacher.qualifications || teacher.qualifications.trim() === '') missingFields.push('Qualifications');
    if (!teacher.ratePerHour || teacher.ratePerHour === 0) missingFields.push('Hourly Rate');
    
    // Check bank details if using direct payment
    if (teacher.paymentMethod === 'direct') {
        if (!teacher.bankDetails || 
            !teacher.bankDetails.bankName || 
            !teacher.bankDetails.accountNumber || 
            !teacher.bankDetails.accountName) {
            missingFields.push('Bank Details');
        }
    }
    
    return missingFields;
};
```

### 👨‍🎓 Student Dashboard Banner

#### Checks for Missing:
1. **Name** - Full name not set or empty
2. **English Level** - Proficiency level not selected
3. **Learning Goals** - Goals not specified
4. **Preferred Schedule** - Availability times not provided

#### Logic:
```javascript
const isProfileIncomplete = () => {
    if (!student) return false;
    
    const missingFields = [];
    
    if (!student.name || student.name.trim() === '') missingFields.push('Name');
    if (!student.level || student.level.trim() === '') missingFields.push('English Level');
    if (!student.goals || student.goals.trim() === '') missingFields.push('Learning Goals');
    if (!student.preferredTimes || student.preferredTimes.trim() === '') missingFields.push('Preferred Schedule');
    
    return missingFields;
};
```

## Visual Design

### 🎨 Banner Appearance
- **Background**: Warm gradient (amber/yellow tones)
  - `linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)`
- **Border**: 2px solid amber (#f59e0b)
- **Icon**: AlertCircle in amber color
- **Shadow**: Subtle amber shadow for depth

### 📐 Layout
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Complete Your Profile                          │
│                                                     │
│     Your profile is incomplete. Complete it to      │
│     [attract more students / help teachers...]      │
│                                                     │
│     Missing: Name, Bio, Qualifications              │
│                                                     │
│     [Complete Profile Now →]                        │
└─────────────────────────────────────────────────────┘
```

### 🎯 Elements
1. **Icon**: AlertCircle (24px, amber)
2. **Heading**: "Complete Your Profile" (bold, dark amber)
3. **Description**: Context-specific message
4. **Missing Fields**: Comma-separated list of incomplete fields
5. **CTA Button**: "Complete Profile Now" (amber background, white text)

## User Experience

### Display Logic
- **Banner shows when**: One or more required fields are missing
- **Banner hidden when**: All required fields are complete
- **Position**: Top of dashboard, before all other content
- **Persistence**: Shows on every dashboard visit until profile is complete

### Button Behavior
- **Teacher**: Links to `/teacher/profile`
- **Student**: Links to `/student/profile`
- **Hover effect**: Darkens on hover (#d97706)
- **Click**: Navigates directly to profile page

### Messages

#### Teacher Message:
> "Your profile is incomplete. Complete it to attract more students and provide them with essential information."

#### Student Message:
> "Complete your profile to help teachers understand your learning goals and provide better lessons."

## Benefits

### For Teachers:
1. **Professional Image**: Complete profile builds trust
2. **Student Attraction**: Detailed info helps students choose
3. **Payment Setup**: Ensures bank details for direct payment
4. **Clear Guidance**: Specific list of what's missing

### For Students:
1. **Better Matching**: Complete profile helps find right teacher
2. **Clear Expectations**: Teachers understand student needs
3. **Personalized Lessons**: Goals and level inform teaching approach
4. **Scheduling**: Preferred times help coordination

### For Platform:
1. **Data Quality**: Ensures complete user profiles
2. **User Engagement**: Prompts action on first login
3. **Better Matches**: Complete profiles improve matching
4. **Professional Standard**: Maintains quality across platform

## Technical Details

### State Management

**Teacher Dashboard:**
```javascript
const [teacher, setTeacher] = useState(null);
// Fetches teacher data from Firebase
```

**Student Dashboard:**
```javascript
const [student, setStudent] = useState(null);
// Fetches student data from Firebase
```

### Conditional Rendering
```javascript
const missingFields = isProfileIncomplete();
const showProfileBanner = missingFields && missingFields.length > 0;

{showProfileBanner && (
    <div>
        {/* Banner content */}
    </div>
)}
```

### Responsive Design
- Banner is fully responsive
- Text adjusts for mobile screens
- Button remains accessible on all devices
- Icon scales appropriately

## Future Enhancements

Possible improvements:
1. **Dismiss Option**: Allow temporary dismissal with "remind me later"
2. **Progress Bar**: Show completion percentage
3. **Priority Levels**: Highlight most important missing fields
4. **Gamification**: Reward profile completion with badges
5. **Email Reminders**: Send email if profile incomplete after X days
6. **Profile Strength**: Display "weak/medium/strong" profile indicator

## Testing Scenarios

### Test Cases:
1. ✅ New teacher with no profile data → Banner shows
2. ✅ Teacher with partial profile → Banner shows missing fields
3. ✅ Teacher with complete profile → Banner hidden
4. ✅ Teacher using direct payment without bank details → Shows bank details in missing
5. ✅ New student with no profile data → Banner shows
6. ✅ Student with partial profile → Banner shows missing fields
7. ✅ Student with complete profile → Banner hidden
8. ✅ Clicking button navigates to profile page
9. ✅ Banner persists across page refreshes until complete

## Related Components

- **TeacherDashboard.jsx**: Main teacher landing page
- **StudentDashboard.jsx**: Main student landing page
- **TeacherProfile.jsx**: Profile editing for teachers
- **StudentProfile.jsx**: Profile editing for students

## Color Palette

- **Background Light**: `#fef3c7`
- **Background Dark**: `#fde68a`
- **Border**: `#f59e0b`
- **Icon**: `#f59e0b`
- **Heading Text**: `#92400e`
- **Body Text**: `#78350f`
- **Button**: `#f59e0b`
- **Button Hover**: `#d97706`
