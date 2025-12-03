# Firebase Production Setup Guide

## Overview
Your application has been successfully converted from mock Firebase (localStorage) to real Firebase Realtime Database. Follow the steps below to complete the setup.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter your project name (e.g., "EnglishHop")
   - Enable/disable Google Analytics (optional)
   - Click **"Create project"**

---

## Step 2: Enable Firebase Realtime Database

1. In your Firebase project, navigate to **"Build" > "Realtime Database"**
2. Click **"Create Database"**
3. Choose a location (select the closest to your users)
4. Start in **"Test mode"** for now (we'll configure security rules later)
5. Click **"Enable"**

---

## Step 3: Enable Firebase Authentication

1. Navigate to **"Build" > "Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **"Email/Password"** authentication
5. Click **"Save"**

---

## Step 4: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app with a nickname (e.g., "EnglishHop Web")
6. Copy the `firebaseConfig` object that appears

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## Step 5: Configure Your Application

1. **Create `.env.local` file** in your project root:
   ```bash
   # Copy the template
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

---

## Step 6: Set Up Database Structure

Your Firebase Realtime Database needs the following structure:

```json
{
  "users": {
    "uid-123": {
      "email": "admin@englishhop.com",
      "role": "admin",
      "createdAt": 1234567890
    }
  },
  "teachers": {
    "teacherId123": {
      "name": "John Doe",
      "email": "john@mail.com",
      "ratePerHour": 5000,
      "paymentMethod": "direct",
      "slotsPurchased": 10,
      "slotsUsed": 3,
      "slotsAvailable": 7,
      "paymentDetails": {
        "bank": "GTBank",
        "accountName": "John Doe",
        "accountNumber": "012xxxxx"
      }
    }
  },
  "students": {
    "studentId456": {
      "name": "Sandra",
      "email": "sandra@mail.com",
      "level": "Beginner",
      "goals": "Improve pronunciation",
      "preferredTimes": "Evenings",
      "matchedTeacher": "teacherId123"
    }
  },
  "matches": {},
  "slotPurchases": {},
  "payments": {}
}
```

**To set up initial data:**
1. Go to Firebase Console > Realtime Database
2. Click the **"+"** icon next to your database URL
3. Add the structure manually, or
4. Use the **Import JSON** feature to upload a JSON file

---

## Step 7: Configure Security Rules

**Important:** Replace the test mode rules with production-ready security rules.

1. In Firebase Console, go to **Realtime Database > Rules**
2. Replace with the following rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "teachers": {
      ".read": "auth != null",
      "$teacherId": {
        ".write": "auth.uid === $teacherId || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "students": {
      ".read": "auth != null",
      "$studentId": {
        ".write": "auth.uid === $studentId || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "matches": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "slotPurchases": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "payments": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "chats": {
      ".read": "auth != null",
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

3. Click **"Publish"**

---

## Step 8: Create Your First Admin User

Since you're starting fresh, you need to create an admin user:

1. **Register through your app** at `/register`
2. **Manually set the role in Firebase**:
   - Go to Firebase Console > Realtime Database
   - Navigate to `users > [your-uid]`
   - Add a field: `role: "admin"`

Alternatively, use the Firebase Console to create the user directly in the database.

---

## Step 9: Test Your Application

1. **Clear browser data** (localStorage, cookies) to remove mock data
2. **Register a new account** or **login** with your admin account
3. **Verify** that data is being saved to Firebase Realtime Database
4. **Check** the Firebase Console to see real-time updates

---

## Migration Notes

### What Changed:
- ✅ Removed `mockFirebase.js` (moved to `_backup/`)
- ✅ Created `firebase.js` with real Firebase SDK
- ✅ Updated all imports across 13 files
- ✅ Configured environment variables for security

### Data Migration:
Your old mock data was stored in **localStorage**. To migrate:

1. **Export from localStorage** (if you want to keep test data):
   - Open browser DevTools > Console
   - Run: `console.log(localStorage.getItem('englishhop_data'))`
   - Copy the JSON output

2. **Import to Firebase**:
   - Format the JSON properly
   - Use Firebase Console > Realtime Database > Import JSON

---

## Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Make sure `.env.local` exists and contains all required variables. Restart dev server.

### Issue: "Permission denied"
**Solution:** Check your Firebase Security Rules. In development, you can temporarily use test mode.

### Issue: "Cannot read properties of undefined"
**Solution:** Ensure your database structure matches the expected format.

### Issue: Environment variables not loading
**Solution:** 
- File must be named `.env.local` (not `.env`)
- All variables must start with `VITE_`
- Restart the dev server after creating/editing `.env.local`

---

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Add environment variables** in your hosting platform's dashboard
2. **Never commit** `.env.local` to git (it's already in `.gitignore`)
3. **Use production security rules** (not test mode)
4. **Enable Firebase App Check** for additional security

---

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Realtime Database Guide](https://firebase.google.com/docs/database)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)

---

**Status:** ✅ Migration Complete - Ready for Firebase Configuration
