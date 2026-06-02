# 🚨 Login Not Working - Troubleshooting Guide

## Current Issue
You're getting "User not found" (404) error when trying to login.

## Possible Causes & Solutions

### 1. ✅ User Doesn't Exist in Database

**To check:**
```bash
cd server
node check-users.js
```

**If no users found:**
- You need to create an account first
- Go to: http://localhost:5173/signup
- Fill in the form and submit

**Quick Fix - Create test user:**
```bash
cd server
node create-test-user.js
```
This creates a pre-verified user:
- Email: `test@example.com`
- Password: `password123`

---

### 2. ❌ Email Not Verified

**Symptom:** Error says "Email is not verified"

**Solution A - Verify via email:**
1. Check your email inbox
2. Click verification link
3. Try logging in again

**Solution B - Manual verification (for testing):**
1. Connect to your MongoDB database
2. Find your user document
3. Set `isVerified: true`

```javascript
// In MongoDB Compass or Shell:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isVerified: true } }
)
```

---

### 3. 🔌 Database Connection Issue

**Check if you're getting DNS errors in server logs.**

**Solution:**
1. Verify your MongoDB URI is correct in `.env`
2. Check MongoDB Atlas:
   - Is cluster running?
   - Is IP whitelisted? (Add 0.0.0.0/0 for testing)
   - Are credentials correct?

**Current URI in .env:**
```
MONGO_URI=mongodb+srv://gauravmishra92812:gauravmishra92812@cluster0.mayo9ah.mongodb.net/Flux-DB
```

**Test connection:**
```bash
cd server
node check-users.js
```

If you see "ECONNREFUSED" or "querySrv" error:
- Check internet connection
- Verify MongoDB cluster is active
- Check if firewall is blocking connection

---

### 4. 🚫 Backend Server Not Running

**Check if server is running:**
```bash
# Windows
netstat -ano | findstr :8000

# If nothing shows, server is not running
```

**Start the server:**
```bash
cd server
npm run dev
# or
node server.js
```

**Expected output:**
```
Server is running on port 8000
Database connected successfully
```

---

### 5. 🌐 Frontend Pointing to Wrong URL

**Check client `.env`:**
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Restart frontend after changing .env:**
```bash
cd client
npm run dev
```

---

### 6. 📧 Wrong Email Format

Looking at your screenshot, the email appears to be:
`neg7777auraoj@gmail.com`

**Things to check:**
1. Is this the exact email you used during signup?
2. Check for typos
3. Email is case-insensitive (converted to lowercase)

**To find what emails exist:**
```bash
cd server
node check-users.js
```

---

### 7. 🔒 CORS or Network Error

**Check browser console (F12):**
- Red errors about CORS?
- Network tab shows failed requests?

**Solution:**
1. Make sure backend `.env` has:
   ```
   CLIENT_URL=http://localhost:5173
   ```
2. Restart backend server

---

## 🔍 Step-by-Step Debugging

### Step 1: Verify Server is Running
```bash
# Open browser and go to:
http://localhost:8000/health

# Should return:
{"success":true,"message":"API is healthy"}
```

If this doesn't work, your server isn't running or is on a different port.

---

### Step 2: Check Database Connection
```bash
cd server
node check-users.js
```

**Expected output:**
- Shows list of users in database
- Shows if they're verified or not

**If connection fails:**
- Check MongoDB URI
- Check internet connection
- Verify MongoDB cluster is running

---

### Step 3: Verify User Exists
From step 2, you should see if your email exists in the database.

**If user doesn't exist:**
- Go to signup page
- Create account
- Verify email

**If user exists but not verified:**
- Check email for verification link
- OR manually set `isVerified: true` in database
- OR use this command:

```bash
cd server
node -e "
import('mongoose').then(async (mongoose) => {
  await mongoose.default.connect(process.env.MONGO_URI);
  const User = mongoose.default.model('User', new mongoose.Schema({}, {strict: false}));
  await User.updateOne(
    { email: 'YOUR_EMAIL_HERE' },
    { isVerified: true }
  );
  console.log('User verified!');
  process.exit(0);
});
"
```

---

### Step 4: Try Test Credentials
```bash
cd server
node create-test-user.js
```

Then login with:
- Email: `test@example.com`
- Password: `password123`

If this works, your system is fine - you just need to create/verify your actual user.

---

### Step 5: Check Frontend Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the POST request to `/api/v1/user/login`

**Check:**
- Status code (404 = user not found, 400 = wrong password, 200 = success)
- Request payload (is email correct?)
- Response body (what's the error message?)

---

## 🎯 Most Likely Solutions

Based on your error ("User not found"), here's what to do:

### Option 1: Create Test User (Quickest)
```bash
cd server
node create-test-user.js
```
Then login with:
- Email: `test@example.com`
- Password: `password123`

### Option 2: Create Real Account
1. Go to http://localhost:5173/signup
2. Fill in your details
3. Click "Create Account"
4. You'll be redirected to verify page
5. **Important:** Manually verify in database (see option 3)

### Option 3: Manually Verify Existing User
If you already signed up but can't verify email:

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to your database
3. Go to `Flux-DB` → `users` collection
4. Find your user document
5. Edit: Set `isVerified` to `true`
6. Save
7. Try logging in again

**Using MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "neg7777auraoj@gmail.com" },
  { $set: { isVerified: true } }
)
```

---

## 🆘 Still Not Working?

### Check Server Logs
Look at your terminal where the server is running. You should see:
```
POST /api/v1/user/login - Status: 404
User not found: neg7777auraoj@gmail.com
```

### Check All Environment Variables
**Server `.env` must have:**
```env
SECRET_KEY=your_secret_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Flux-DB
CLIENT_URL=http://localhost:5173
```

**Client `.env` must have:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Restart Everything
```bash
# Stop all running servers (Ctrl+C)

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

---

## ✅ Success Checklist

Once you fix the issue, you should:
- [x] Server running on port 8000
- [x] Database connected successfully
- [x] User exists in database
- [x] User is verified (`isVerified: true`)
- [x] Can access http://localhost:8000/health
- [x] Frontend can make API calls
- [x] Login returns 200 status with user data and token

---

## 📞 Quick Reference Commands

```bash
# Check if server is running
netstat -ano | findstr :8000

# Test database connection
cd server
node check-users.js

# Create test user
cd server
node create-test-user.js

# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev

# Test API endpoint
curl http://localhost:8000/health
```

---

**Most Common Fix:** Create test user with `node create-test-user.js` and login with test credentials!
