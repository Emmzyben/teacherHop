# Creating Your First Admin User

Since you've migrated from mock Firebase to real Firebase, you need to manually create your first admin user in the Firebase Realtime Database.

## Option 1: Create Admin User via Firebase Console (Recommended)

### Step 1: Register a New Account
1. Go to your app at `http://localhost:5173/register`
2. Register with your admin email and password
3. Select any role (it doesn't matter, we'll change it)
4. Complete the registration

### Step 2: Get Your User ID
1. After registration, check the browser console (F12)
2. Or go to Firebase Console > Authentication > Users
3. Copy your User ID (UID)

### Step 3: Set Admin Role in Firebase
1. Go to Firebase Console > Realtime Database
2. Navigate to the `users` node
3. Find your UID (or create it if it doesn't exist)
4. Set the structure:
```json
{
  "users": {
    "YOUR_UID_HERE": {
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": 1234567890
    }
  }
}
```

### Step 4: Log Out and Log Back In
1. Log out from your app
2. Log in again with your admin credentials
3. You should now be redirected to `/admin`

---

## Option 2: Quick Setup via Firebase Console

If you haven't registered yet:

1. Go to Firebase Console > Authentication
2. Click "Add user" 
3. Enter email and password
4. Copy the UID that's generated
5. Go to Realtime Database
6. Add this structure:

```json
{
  "users": {
    "PASTE_UID_HERE": {
      "email": "admin@yoursite.com",
      "role": "admin",
      "createdAt": 1733187000000
    }
  }
}
```

6. Now you can log in with that email/password

---

## Database Structure for All User Types

Your Firebase Realtime Database should have this structure:

```json
{
  "users": {
    "uid-admin-001": {
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": 1733187000000
    },
    "uid-teacher-001": {
      "email": "teacher@example.com",
      "role": "teacher",
      "createdAt": 1733187000000
    },
    "uid-student-001": {
      "email": "student@example.com",
      "role": "student",
      "createdAt": 1733187000000
    }
  },
  "teachers": {
    "uid-teacher-001": {
      "name": "John Teacher",
      "email": "teacher@example.com",
      "ratePerHour": 5000,
      "paymentMethod": "direct",
      "slotsPurchased": 0,
      "slotsUsed": 0,
      "slotsAvailable": 0
    }
  },
  "students": {
    "uid-student-001": {
      "name": "Jane Student",
      "email": "student@example.com",
      "level": "Beginner",
      "goals": "",
      "budget": "",
      "preferredTimes": "",
      "matchedTeacher": null
    }
  },
  "matches": {},
  "slotPurchases": {},
  "payments": {}
}
```

---

## Troubleshooting

### "User profile not found" Error
- Make sure the `users/${uid}` path exists in Firebase
- Verify the `role` field is set to "admin", "teacher", or "student"

### Dashboard Link Not Showing
- Check browser console for errors
- Verify you're logged in (check Firebase Console > Authentication)
- Make sure the `users/${uid}/role` field exists

### Redirected to Home Instead of Dashboard
- The user record in `users/${uid}` must have a valid `role` field
- Check Firebase Console > Realtime Database to verify

---

## Security Note

After setting up your admin user, make sure to update your Firebase Security Rules to prevent unauthorized access to admin functions.
