# Migration Checklist - Authentication System Upgrade

## Overview

This document provides a step-by-step checklist for migrating from the old authentication system to the new simplified JWT-based system.

---

## 🎯 Pre-Migration Checklist

- [ ] Backup your database
- [ ] Backup your `.env` files
- [ ] Review `AUTHENTICATION_GUIDE.md`
- [ ] Review `AUTH_REBUILD_SUMMARY.md`
- [ ] Test the new system in development first
- [ ] Plan a maintenance window (if in production)

---

## 📋 Migration Steps

### Step 1: Backend Migration

#### 1.1 Verify New Files
- [ ] `server/controllers/userController.js` exists and is updated
- [ ] `server/models/userModel.js` exists and is updated
- [ ] `server/middleware/isAuthenticated.js` exists and is updated
- [ ] `server/routes/userRoute.js` exists and is updated

#### 1.2 Verify Old Files Removed
- [ ] `server/models/sessionModel.js` deleted
- [ ] `server/emailVerify/sendOTPMail.js` deleted
- [ ] `server/emailVerify/verifyEmail.js` deleted

#### 1.3 Environment Variables
- [ ] `SECRET_KEY` is set in `.env`
- [ ] `MONGO_URI` is correct
- [ ] `CLIENT_URL` matches your frontend URL
- [ ] Optional: Email config removed (SMTP settings no longer needed for auth)

#### 1.4 Database Cleanup (Optional)
```javascript
// Run in MongoDB shell to clean old auth fields
db.users.updateMany(
  {},
  {
    $unset: {
      token: "",
      isVerified: "",
      isLoggedIn: "",
      otp: "",
      otpExpiry: "",
      phoneNumber: ""
    }
  }
);

// Drop sessions collection (no longer used)
db.sessions.drop();
```

- [ ] Old user fields removed (optional)
- [ ] Sessions collection dropped (optional)
- [ ] Existing users can still login (test one user)

#### 1.5 Test Backend
```bash
cd server
npm install
npm run dev
```

- [ ] Server starts without errors
- [ ] No JWT secret warnings
- [ ] Routes are registered correctly
- [ ] Test registration endpoint with curl
- [ ] Test login endpoint with curl

---

### Step 2: Frontend Migration

#### 2.1 Verify New Files
- [ ] `client/src/pages/Login.jsx` updated
- [ ] `client/src/pages/Signup.jsx` updated
- [ ] `client/src/components/ProtectedRoute.jsx` updated
- [ ] `client/src/pages/AdminLogin.jsx` updated
- [ ] `client/src/components/ui/Navbar.jsx` updated
- [ ] `client/src/App.jsx` updated
- [ ] `client/src/lib/api.js` updated

#### 2.2 Verify Old Files Removed
- [ ] `client/src/pages/VerifyEmail.jsx` deleted
- [ ] `client/src/pages/Verify.jsx` deleted
- [ ] Removed from App.jsx imports and routes

#### 2.3 Environment Variables
- [ ] `VITE_API_BASE_URL` is set correctly in `.env`

#### 2.4 Test Frontend
```bash
cd client
npm install
npm run dev
```

- [ ] Frontend starts without errors
- [ ] No import errors
- [ ] Routes load correctly
- [ ] Login page accessible
- [ ] Signup page accessible
- [ ] No console errors

---

### Step 3: Integration Testing

#### 3.1 Registration Flow
- [ ] Open signup page
- [ ] Fill form with valid data
- [ ] Submit successfully
- [ ] Token stored in localStorage (key: `token`)
- [ ] User redirected to home
- [ ] User data in Redux
- [ ] Navbar shows user menu

#### 3.2 Login Flow
- [ ] Open login page
- [ ] Enter valid credentials
- [ ] Login successfully
- [ ] Token stored in localStorage
- [ ] User redirected to home
- [ ] Cart loads (if any)
- [ ] Session persists on refresh

#### 3.3 Logout Flow
- [ ] Click logout button
- [ ] Token removed from localStorage
- [ ] Redux state cleared
- [ ] Redirected to login
- [ ] Navbar shows "Sign in" button

#### 3.4 Protected Routes
- [ ] Without auth: Redirect to login
- [ ] With auth: Access granted
- [ ] Admin routes work for admins
- [ ] Admin routes blocked for regular users

#### 3.5 Validation
- [ ] Invalid email shows error
- [ ] Short password shows error
- [ ] Duplicate email shows error
- [ ] Wrong password shows error
- [ ] Empty fields show error

---

### Step 4: User Communication (Production Only)

If you're migrating a production system with existing users:

#### 4.1 Notify Users
- [ ] Email users about maintenance window
- [ ] Explain they'll need to logout and login again
- [ ] Provide support contact

#### 4.2 Migration Notice Template
```
Subject: Authentication System Upgrade - Action Required

Dear [User],

We're upgrading our authentication system to provide you with a 
faster and more secure login experience.

What you need to do:
1. After the upgrade, you'll be automatically logged out
2. Simply log back in with your existing email and password
3. Your account data and order history are safe and unchanged

When: [Date and Time]
Expected Downtime: ~5 minutes

If you have any issues logging in after the upgrade, please 
contact support at [email].

Thank you for your patience!
```

#### 4.3 Prepare Support Team
- [ ] Brief support team on changes
- [ ] Provide troubleshooting guide
- [ ] Monitor support tickets post-migration

---

### Step 5: Production Deployment

#### 5.1 Pre-Deployment
- [ ] All tests pass in staging
- [ ] Database backup completed
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Users notified (if applicable)

#### 5.2 Backend Deployment
- [ ] Stop old server
- [ ] Pull latest code
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env` variables
- [ ] Start new server: `npm start` or `pm2 restart`
- [ ] Check logs for errors
- [ ] Test health endpoint: `GET /health`
- [ ] Test registration endpoint
- [ ] Test login endpoint

#### 5.3 Frontend Deployment
- [ ] Build production bundle: `npm run build`
- [ ] Upload to hosting (Vercel/Netlify/etc.)
- [ ] Verify environment variables
- [ ] Clear CDN cache (if applicable)
- [ ] Test production URL
- [ ] Verify API calls work

#### 5.4 Post-Deployment Testing
- [ ] Register new account in production
- [ ] Login with new account
- [ ] Test session persistence
- [ ] Test logout
- [ ] Test admin access
- [ ] Monitor server logs
- [ ] Monitor error tracking (Sentry/etc.)

---

### Step 6: Post-Migration Monitoring

#### 6.1 First 24 Hours
- [ ] Monitor server logs every hour
- [ ] Check error rates
- [ ] Monitor support tickets
- [ ] Test user flows multiple times
- [ ] Check database for anomalies
- [ ] Verify no authentication issues

#### 6.2 First Week
- [ ] Daily log review
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Security audit
- [ ] Database cleanup (if not done earlier)

#### 6.3 Success Metrics
- [ ] Zero authentication errors
- [ ] All users can login
- [ ] No support tickets about login issues
- [ ] Session persistence working
- [ ] Protected routes working
- [ ] Admin access working

---

## 🚨 Rollback Plan

If something goes wrong during migration:

### Backend Rollback
1. Stop new server
2. Restore old code from backup/git
3. Restore old database (if modified)
4. Start old server
5. Verify old system works

### Frontend Rollback
1. Restore old frontend code
2. Rebuild: `npm run build`
3. Redeploy
4. Clear cache
5. Verify old system works

### User Communication
```
Subject: Authentication System - Service Restored

We've temporarily reverted the authentication upgrade to ensure 
uninterrupted service. Your accounts are safe and you can continue 
using the platform as normal.

We'll schedule the upgrade for a later date and notify you in advance.

Thank you for your patience.
```

---

## 📊 Migration Checklist Template

Copy and fill this out during migration:

```
=== AUTHENTICATION SYSTEM MIGRATION ===

Date: _______________
Performed by: _______________
Environment: [ ] Development [ ] Staging [ ] Production

PRE-MIGRATION
[ ] Database backup completed
[ ] Code backup completed
[ ] Team notified
[ ] Users notified (production only)

BACKEND
[ ] New files verified
[ ] Old files removed
[ ] Environment variables verified
[ ] Server starts successfully
[ ] API endpoints tested

FRONTEND
[ ] New files verified
[ ] Old files removed
[ ] Environment variables verified
[ ] Frontend builds successfully
[ ] Routes accessible

TESTING
[ ] Registration works
[ ] Login works
[ ] Logout works
[ ] Session persistence works
[ ] Protected routes work
[ ] Admin access works
[ ] Validation works

DEPLOYMENT (Production)
[ ] Backend deployed
[ ] Frontend deployed
[ ] Health checks pass
[ ] End-to-end testing complete

POST-MIGRATION
[ ] Monitoring in place
[ ] No errors in logs
[ ] Users can authenticate
[ ] Support tickets monitored

STATUS: [ ] Success [ ] Issues Found [ ] Rolled Back

Notes:
_________________________________
_________________________________
_________________________________

Issues Encountered:
_________________________________
_________________________________
_________________________________

Resolution:
_________________________________
_________________________________
_________________________________
```

---

## 🆘 Troubleshooting During Migration

### Issue: Server won't start
**Check:**
- [ ] SECRET_KEY is set in .env
- [ ] MONGO_URI is correct
- [ ] Port is not in use
- [ ] Dependencies installed

**Fix:**
```bash
# Verify environment variables
cat .env | grep SECRET_KEY
cat .env | grep MONGO_URI

# Kill process on port (if needed)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend build fails
**Check:**
- [ ] All imports are correct
- [ ] No syntax errors
- [ ] Dependencies installed

**Fix:**
```bash
# Clear cache and rebuild
rm -rf node_modules .vite dist
npm install
npm run build
```

### Issue: Users can't login
**Check:**
- [ ] Token storage key is `token` not `accessToken`
- [ ] API URL is correct
- [ ] CORS is configured
- [ ] JWT secret hasn't changed

**Fix:**
```bash
# Backend logs
cd server
npm run dev
# Watch for authentication errors

# Test endpoint directly
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Issue: Session doesn't persist
**Check:**
- [ ] Token is in localStorage
- [ ] App.jsx session restoration runs
- [ ] GET /user/me endpoint works

**Fix:**
```javascript
// In browser console
localStorage.getItem('token')
// Should return JWT token

// Check Redux state
// Open Redux DevTools → State → user
```

### Issue: Admin routes not accessible
**Check:**
- [ ] User role is "admin" in database
- [ ] Token is valid
- [ ] isAdmin middleware works

**Fix:**
```javascript
// Update user role in MongoDB
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

---

## ✅ Migration Complete!

Once all checklist items are complete:

1. Document completion date
2. Archive old authentication code (don't delete from git history)
3. Update team documentation
4. Schedule follow-up review (1 week)
5. Celebrate! 🎉

---

## 📞 Support Contacts

**For Migration Issues:**
- Developer: [Your Name/Email]
- Database Admin: [Name/Email]
- DevOps: [Name/Email]

**For User Issues:**
- Support Email: support@yourcompany.com
- Support Tickets: [URL]

---

**Last Updated:** June 2026  
**Version:** 2.0.0
