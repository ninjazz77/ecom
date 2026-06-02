# 🚀 Deployment Checklist

Use this checklist to deploy your authentication fixes to production.

---

## Pre-Deployment

### ✅ Local Changes Complete
- [x] Fixed missing SMTP_USER configuration
- [x] Fixed API URL configuration
- [x] Added client-side validation
- [x] Improved error messages
- [x] Added comprehensive logging
- [x] Removed duplicate code
- [x] Frontend build successful (351 KB, 0 errors)
- [x] All diagnostics passed

### ⚠️ Action Required Before Deploying
- [ ] **CRITICAL:** Update `server/.env` line 4: Replace `your-email@gmail.com` with actual Gmail address
- [ ] Commit all changes to Git
- [ ] Push to GitHub main branch

---

## Backend Deployment (Render)

### Step 1: Update Environment Variables
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service: `ecom-sqqa`
3. Click "Environment" tab
4. Add/Update these variables:

```
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=yyqw ooam bqcj zdhu
EMAIL_FROM=your-actual-email@gmail.com
EMAIL_FROM_NAME=Ekart
```

5. Click "Save Changes"

### Step 2: Deploy
- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Wait for deployment to complete (watch logs)
- [ ] Check for successful startup message

### Step 3: Verify Backend
- [ ] Test health endpoint: https://ecom-sqqa.onrender.com/health
  - Should return: `{"success":true,"message":"API is healthy"}`
- [ ] Check logs for startup messages
- [ ] Look for: "Server is running on port 8000"
- [ ] Look for: "Database connected successfully"
- [ ] Look for: "Allowed origins: [...]"

---

## Frontend Deployment (Vercel)

### Step 1: Verify Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on project: `e-commerce-ten-sigma-62`
3. Click "Settings" → "Environment Variables"
4. Verify these exist:

```
VITE_API_BASE_URL=https://ecom-sqqa.onrender.com/api/v1
VITE_API_URL=https://ecom-sqqa.onrender.com
```

5. If missing, add them and redeploy

### Step 2: Deploy
- [ ] Push to GitHub (Vercel auto-deploys)
- [ ] OR click "Deploy" in Vercel dashboard
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for success

### Step 3: Verify Frontend
- [ ] Visit: https://e-commerce-ten-sigma-62.vercel.app
- [ ] Check homepage loads
- [ ] Check no console errors in browser DevTools

---

## Post-Deployment Testing

### 🧪 Complete Authentication Flow Test (10 minutes)

#### 1. Registration Test
- [ ] Open: https://e-commerce-ten-sigma-62.vercel.app/signup
- [ ] Fill form with test data:
  - First Name: Test
  - Last Name: User
  - Email: your-test-email@gmail.com
  - Password: testpass123
- [ ] Click "Create Account"
- [ ] **Expected:** Success toast "Account created! Check your email"
- [ ] **Expected:** Redirect to /verify page
- [ ] **Check Render logs for:** "Verification email sent successfully to: your-test-email@gmail.com"

#### 2. Email Verification Test
- [ ] Open Gmail inbox (your-test-email@gmail.com)
- [ ] **Expected:** Email from Ekart with subject "Verify your Ekart account"
- [ ] Click "Verify Email" button in email
- [ ] **Expected:** Opens https://e-commerce-ten-sigma-62.vercel.app/verify/{token}
- [ ] **Expected:** Shows "Verified!" with green checkmark
- [ ] **Expected:** Message "Email verified! Redirecting to login…"
- [ ] **Expected:** Auto-redirect to /login after 2.5 seconds
- [ ] **Check Render logs for:** "User verified successfully: your-test-email@gmail.com"

#### 3. Login Test (Before Verification) ❌
- [ ] Create another test account but DON'T verify
- [ ] Try to login with unverified account
- [ ] **Expected:** Error "Email is not verified. Please verify your inbox before logging in."
- [ ] **Expected:** Prompt to resend verification
- [ ] **Check Render logs for:** "Login blocked - email not verified: email@example.com"

#### 4. Login Test (After Verification) ✅
- [ ] Go to: https://e-commerce-ten-sigma-62.vercel.app/login
- [ ] Enter verified test account credentials
- [ ] Click "Sign In"
- [ ] **Expected:** Success toast "Welcome back! ✨"
- [ ] **Expected:** Redirect to home page
- [ ] **Expected:** User name appears in navbar
- [ ] **Expected:** Can access protected routes (/cart, /profile)

#### 5. Resend Verification Test
- [ ] Create account with different email
- [ ] Go to: /verify
- [ ] Enter the email address
- [ ] Click "Resend Verification"
- [ ] **Expected:** Success toast "Verification email sent! Check your inbox"
- [ ] **Expected:** New email received
- [ ] **Expected:** New verification link works
- [ ] **Check Render logs for:** "Verification email resent successfully to: email@example.com"

#### 6. Token Expiry Test
- [ ] Create new account
- [ ] Wait 11 minutes (token expires in 10 min)
- [ ] Try to use expired verification link
- [ ] **Expected:** Error "The verification token has expired. Please request a new verification email."
- [ ] **Expected:** Can click "Try Again" to resend

#### 7. Already Verified Test
- [ ] Use a verified account
- [ ] Try to use verification link again
- [ ] **Expected:** Success message "Email is already verified. You can login now."

#### 8. Protected Routes Test
- [ ] While logged IN, visit /profile/:userId
- [ ] While logged IN, visit /cart
- [ ] **Expected:** Both load successfully
- [ ] Logout (if logout exists)
- [ ] Try to visit /profile/:userId again
- [ ] **Expected:** Redirect to /login (if ProtectedRoute configured)

#### 9. Admin Login Test (Separate)
- [ ] Go to: /admin-login
- [ ] Try admin credentials
- [ ] **Expected:** Admin login works independently
- [ ] **Expected:** Can access /admin dashboard

---

## Monitoring First Real Users

### Watch Render Logs for:
```
✅ Verification email sent successfully to: user@example.com
✅ User verified successfully: user@example.com
✅ Login successful (check for user in session)
```

### Watch for Errors:
```
❌ Email service is not configured
   → Fix: SMTP_USER not set
   
❌ Token verification failed
   → Normal: Token expired, user needs to resend
   
❌ Login blocked - email not verified
   → Normal: User hasn't clicked verification link
   
❌ CORS error
   → Fix: Check CLIENT_URLS includes Vercel domain
```

---

## Rollback Plan (If Issues Occur)

### If Backend Issues:
1. Go to Render → Your Service → "Rollback"
2. Select previous deployment
3. Investigate logs
4. Fix issue locally
5. Redeploy

### If Frontend Issues:
1. Go to Vercel → Your Project → "Deployments"
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Fix issue locally
5. Redeploy

### If Email Issues:
1. Verify SMTP_USER and SMTP_PASS are correct
2. Test with a simple nodemailer script
3. Check Gmail "Less secure app access" settings
4. Verify App Password is valid
5. Check spam folder

---

## Success Criteria

✅ **All test steps pass**  
✅ **Render logs show successful operations**  
✅ **No console errors in browser**  
✅ **Users can register → verify → login smoothly**  
✅ **Emails are delivered within 1 minute**  
✅ **Error messages are clear and helpful**  

---

## Emergency Contacts / Resources

- **Render Logs:** https://dashboard.render.com/
- **Vercel Logs:** https://vercel.com/dashboard
- **Gmail SMTP:** https://support.google.com/mail/answer/7126229
- **Documentation:** See AUTHENTICATION_FIX_REPORT.md

---

## Final Notes

- Keep this checklist handy during deployment
- Take screenshots of successful test results
- Monitor logs for at least 30 minutes after deployment
- Be ready to rollback if critical issues arise
- Document any new issues found

---

**Good luck with deployment! 🚀**

---

## Quick Reference

**Backend URL:** https://ecom-sqqa.onrender.com  
**Frontend URL:** https://e-commerce-ten-sigma-62.vercel.app  
**Health Check:** https://ecom-sqqa.onrender.com/health  

**Key Files Modified:**
- server/.env
- server/controllers/userController.js
- client/.env
- client/src/pages/Signup.jsx
- client/src/pages/Login.jsx
- client/src/pages/Verify.jsx

**New Documentation:**
- AUTHENTICATION_FIX_REPORT.md
- QUICK_FIX_GUIDE.md
- CHANGES_SUMMARY.md
- DEPLOYMENT_CHECKLIST.md (this file)
