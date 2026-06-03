# Authentication Testing Guide

## Quick Test Checklist

Use this checklist to quickly test the new authentication system.

---

## 🚀 Setup

1. **Start Backend:**
```bash
cd server
npm run dev
```
Expected: Server running on http://localhost:8000

2. **Start Frontend:**
```bash
cd client
npm run dev
```
Expected: Frontend running on http://localhost:5173

---

## ✅ Test Cases

### 1. Registration Test

**Steps:**
1. Open http://localhost:5173/signup
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@test.com
   - Password: password123
3. Click "Create Account"

**Expected Results:**
- ✅ Success toast: "Account created successfully! Welcome to Flux! 🎉"
- ✅ Redirect to home page (/)
- ✅ User menu visible in navbar
- ✅ Check localStorage: Key "token" exists
- ✅ Check Redux DevTools: user object populated

**API Call:**
```
POST http://localhost:8000/api/v1/user/register
Status: 201 Created
Response: { success: true, user: {...}, token: "..." }
```

---

### 2. Login Test

**Steps:**
1. Logout if logged in
2. Open http://localhost:5173/login
3. Enter credentials:
   - Email: john.doe@test.com
   - Password: password123
4. Click "Sign In"

**Expected Results:**
- ✅ Success toast: "Welcome back! ✨"
- ✅ Redirect to home page (/)
- ✅ User menu visible in navbar
- ✅ Token in localStorage

**API Call:**
```
POST http://localhost:8000/api/v1/user/login
Status: 200 OK
Response: { success: true, user: {...}, token: "..." }
```

---

### 3. Session Persistence Test

**Steps:**
1. Login successfully
2. Refresh the page (F5 or Ctrl+R)

**Expected Results:**
- ✅ Still logged in
- ✅ User data persists
- ✅ No redirect to login

**API Call:**
```
GET http://localhost:8000/api/v1/user/me
Status: 200 OK
Response: { success: true, user: {...} }
```

---

### 4. Protected Route Test

**Steps:**
1. Logout
2. Manually navigate to http://localhost:5173/profile/123456789
3. Should redirect to /login
4. Login
5. Navigate to profile again

**Expected Results:**
- ✅ Without auth: Redirect to /login
- ✅ With auth: Access granted

---

### 5. Logout Test

**Steps:**
1. Login
2. Click logout button in navbar

**Expected Results:**
- ✅ Success toast: "See you soon!"
- ✅ Redirect to /login
- ✅ Token removed from localStorage
- ✅ Redux state cleared
- ✅ Navbar shows "Sign in" button

---

### 6. Validation Tests

#### Test 6a: Invalid Email
**Steps:**
1. Go to /signup
2. Enter email: "notanemail"
3. Submit

**Expected:** Error toast: "Please enter a valid email address"

#### Test 6b: Short Password
**Steps:**
1. Go to /signup
2. Enter password: "12345" (5 characters)
3. Submit

**Expected:** Error toast: "Password must be at least 6 characters long"

#### Test 6c: Duplicate Email
**Steps:**
1. Register with email: test@test.com
2. Try to register again with same email

**Expected:** Error toast: "User with this email already exists"

#### Test 6d: Wrong Password
**Steps:**
1. Go to /login
2. Enter correct email but wrong password
3. Submit

**Expected:** Error toast: "Invalid email or password"

---

### 7. Admin Access Test

**Setup - Create Admin User:**

**Option 1: Via MongoDB (Easiest)**
1. Login with a regular account
2. Open MongoDB Compass or shell
3. Find the user in `users` collection
4. Update: `role: "admin"`

**Option 2: Via Node.js**
```javascript
// In MongoDB shell or script
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

**Test Steps:**
1. Go to http://localhost:5173/admin-login
2. Login with admin credentials
3. Should redirect to /admin dashboard

**Expected Results:**
- ✅ Admin can access /admin
- ✅ Regular user cannot access /admin (redirects to /)
- ✅ Admin sees "Admin" link in navbar

---

### 8. Profile Update Test

**Steps:**
1. Login
2. Click "Account" in navbar
3. Update:
   - First Name
   - City
   - Phone Number
4. (Optional) Upload profile picture
5. Click "Save Changes"

**Expected Results:**
- ✅ Success toast: "Profile updated successfully"
- ✅ Changes persist after page reload
- ✅ Profile picture appears in navbar (if uploaded)

**API Call:**
```
PUT http://localhost:8000/api/v1/user/update/:id
Status: 200 OK
Response: { success: true, user: {...} }
```

---

## 🔍 Debugging Tips

### Check Token in Browser
1. Open DevTools (F12)
2. Go to Application tab
3. Local Storage → http://localhost:5173
4. Look for key: `token`
5. Value should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Check Redux State
1. Install Redux DevTools extension
2. Open DevTools
3. Click Redux tab
4. Check `user` state
5. Should contain user object or null

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: XHR
4. Watch for API calls to:
   - POST /user/register
   - POST /user/login
   - GET /user/me
5. Check request/response

### Check Server Logs
Monitor terminal running `npm run dev` in server directory:
- Should show incoming requests
- Should show any errors
- Check for JWT verification logs

---

## 🧪 API Testing with curl

### Test Registration
```bash
curl -X POST http://localhost:8000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "curl.test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl.test@example.com",
    "password": "password123"
  }'
```

### Test Get Current User (with token)
```bash
# Replace YOUR_TOKEN with actual token from login response
curl -X GET http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Logout
```bash
curl -X POST http://localhost:8000/api/v1/user/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Expected Response Formats

### Successful Registration
```json
{
  "success": true,
  "message": "Registration successful! Welcome to Flux.",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "role": "user",
    "profilePic": "",
    "isBlocked": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "role": "user",
    "profilePic": "",
    "isBlocked": false,
    "city": "",
    "state": "",
    "zipCode": "",
    "phoneNo": "",
    "address": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## ⚠️ Common Issues

### Issue: Token not found in localStorage
**Solution:** Check key is `token` not `accessToken`. Clear localStorage and login again.

### Issue: CORS error
**Solution:** Ensure CLIENT_URL in server/.env is http://localhost:5173

### Issue: User not persisting on reload
**Solution:** Check App.jsx session restoration logic. Ensure token exists.

### Issue: Can't access protected routes
**Solution:** Verify token and user in Redux state. Check ProtectedRoute component.

### Issue: Admin routes not working
**Solution:** Update user role to "admin" in database.

---

## ✅ Success Criteria

All tests should pass with these results:

- ✅ Can register new account
- ✅ Can login with valid credentials
- ✅ Session persists on page reload
- ✅ Protected routes work correctly
- ✅ Can logout successfully
- ✅ Validation catches invalid inputs
- ✅ Admin access works for admin users
- ✅ Profile updates save correctly
- ✅ No console errors
- ✅ All API calls return expected responses

---

## 📝 Test Results Template

Use this template to document your testing:

```
# Authentication Test Results
Date: _______________
Tester: _______________

## Test Results

1. Registration: [ ] Pass [ ] Fail
   Notes: _________________________________

2. Login: [ ] Pass [ ] Fail
   Notes: _________________________________

3. Session Persistence: [ ] Pass [ ] Fail
   Notes: _________________________________

4. Protected Routes: [ ] Pass [ ] Fail
   Notes: _________________________________

5. Logout: [ ] Pass [ ] Fail
   Notes: _________________________________

6. Validation: [ ] Pass [ ] Fail
   Notes: _________________________________

7. Admin Access: [ ] Pass [ ] Fail
   Notes: _________________________________

8. Profile Update: [ ] Pass [ ] Fail
   Notes: _________________________________

## Overall Result: [ ] All Pass [ ] Some Failed

Issues Found:
_________________________________
_________________________________
_________________________________
```

---

**Happy Testing! 🎉**
