# 🚀 Authentication System - Quick Reference

> One-page reference for the most common auth operations

---

## 📡 API Endpoints Cheat Sheet

### Registration
```http
POST /api/v1/user/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

→ Returns: { success, message, user, token }
```

### Login
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

→ Returns: { success, message, user, token }
```

### Get Current User
```http
GET /api/v1/user/me
Authorization: Bearer <token>

→ Returns: { success, user }
```

### Logout
```http
POST /api/v1/user/logout
Authorization: Bearer <token>

→ Returns: { success, message }
```

### Update Profile
```http
PUT /api/v1/user/update/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "firstName": "John",
  "lastName": "Doe",
  "city": "New York",
  "profilePic": <file>
}

→ Returns: { success, message, user }
```

---

## 🔐 Frontend Code Snippets

### Registration
```javascript
import api from "@/lib/api";
import { setUser } from "@/redux/userSlice";
import { useDispatch } from "react-redux";

const dispatch = useDispatch();

const response = await api.post("/user/register", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123"
});

if (response.data.success) {
  localStorage.setItem("token", response.data.token);
  dispatch(setUser(response.data.user));
  // Redirect to home
}
```

### Login
```javascript
const response = await api.post("/user/login", {
  email: "john@example.com",
  password: "password123"
});

if (response.data.success) {
  localStorage.setItem("token", response.data.token);
  dispatch(setUser(response.data.user));
  // Load cart
  const cartRes = await api.get("/cart");
  dispatch(setCart(cartRes.data.cart));
  // Redirect to home
}
```

### Logout
```javascript
await api.post("/user/logout");
localStorage.removeItem("token");
dispatch(setUser(null));
dispatch(setCart(null));
// Redirect to login
```

### Check if User is Authenticated
```javascript
import { useSelector } from "react-redux";

const { user } = useSelector((state) => state.user);
const token = localStorage.getItem("token");

const isAuthenticated = !!(user && token);
```

### Protected Component
```javascript
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const MyComponent = () => {
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <div>Protected content</div>;
};
```

---

## 🔧 Backend Code Snippets

### Create New Endpoint (Protected)
```javascript
import { isAuthenticated } from "../middleware/isAuthenticated.js";

router.get("/my-endpoint", isAuthenticated, async (req, res) => {
  try {
    // req.user is available (attached by middleware)
    const userId = req.userId;
    
    // Your logic here
    
    return res.status(200).json({
      success: true,
      data: yourData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error message"
    });
  }
});
```

### Create Admin-Only Endpoint
```javascript
import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";

router.delete("/admin-action", isAuthenticated, isAdmin, async (req, res) => {
  // Only admins can access this
  // req.user.role === "admin"
});
```

### Hash Password
```javascript
import bcrypt from "bcryptjs";

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### Verify Password
```javascript
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### Generate JWT Token
```javascript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: user._id },
  process.env.SECRET_KEY,
  { expiresIn: "30d" }
);
```

### Verify JWT Token
```javascript
try {
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const userId = decoded.id;
} catch (error) {
  // Token invalid or expired
}
```

---

## 🗄️ Database Queries

### Find User by Email
```javascript
const user = await User.findOne({ 
  email: email.toLowerCase().trim() 
});
```

### Find User by ID
```javascript
const user = await User.findById(userId);
```

### Update User
```javascript
const updatedUser = await User.findByIdAndUpdate(
  userId,
  { $set: { firstName: "John", city: "NYC" } },
  { new: true, runValidators: true }
);
```

### Create User
```javascript
const user = await User.create({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: hashedPassword
});
```

### Block User
```javascript
await User.findByIdAndUpdate(userId, { isBlocked: true });
```

### Change User Role
```javascript
await User.findByIdAndUpdate(userId, { role: "admin" });
```

---

## 🧪 Testing Commands

### cURL Tests

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**Get User (replace TOKEN):**
```bash
curl -X GET http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Debugging Checklist

### User Can't Login
- [ ] Check email/password in database
- [ ] Verify password is hashed
- [ ] Check if user is blocked (`isBlocked: false`)
- [ ] Test password with bcrypt.compare()
- [ ] Check server logs for errors

### Token Not Working
- [ ] Check token exists in localStorage (key: `token`)
- [ ] Verify token format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Test token at jwt.io
- [ ] Check SECRET_KEY in .env matches
- [ ] Verify Authorization header: `Bearer <token>`

### Session Not Persisting
- [ ] Token in localStorage?
- [ ] App.jsx session restoration running?
- [ ] GET /user/me endpoint working?
- [ ] Redux state updating?
- [ ] Check browser console for errors

### Protected Routes Not Working
- [ ] User in Redux state?
- [ ] Token in localStorage?
- [ ] ProtectedRoute component configured correctly?
- [ ] Check route definition in App.jsx

---

## 📊 Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Login successful |
| 201 | Created | Registration successful |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | User blocked or insufficient permissions |
| 404 | Not Found | User doesn't exist |
| 500 | Server Error | Database error, unexpected error |

---

## 🎯 Validation Rules

| Field | Rule |
|-------|------|
| Email | Valid format (`user@domain.com`) |
| Email | Unique (not already registered) |
| Password | Minimum 6 characters |
| First Name | Required, not empty |
| Last Name | Required, not empty |
| Role | Must be `user` or `admin` |

---

## 🔑 Environment Variables

**Backend (.env):**
```env
SECRET_KEY=<32-byte-random-hex>
MONGO_URI=mongodb+srv://...
PORT=8000
CLIENT_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🚨 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "All fields are required" | Missing registration data | Fill all fields |
| "Please enter a valid email address" | Invalid email format | Use valid email |
| "Password must be at least 6 characters" | Short password | Use 6+ characters |
| "User with this email already exists" | Duplicate email | Use different email or login |
| "Invalid email or password" | Wrong credentials | Check email/password |
| "Access denied. No token provided." | Missing Authorization header | Add Bearer token |
| "Token has expired" | Old token | Login again |
| "Your account has been blocked" | Admin blocked user | Contact support |
| "Access denied. Admin privileges required." | Not an admin | Need admin role |

---

## 🛠️ Quick Fixes

### Reset User Password
```javascript
// In MongoDB shell or script
const bcrypt = require('bcryptjs');
const newPassword = 'newpassword123';
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(newPassword, salt);

db.users.updateOne(
  { email: "user@example.com" },
  { $set: { password: hashedPassword } }
);
```

### Make User Admin
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
);
```

### Unblock User
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isBlocked: false } }
);
```

### Clear All Tokens (Force Re-login)
```javascript
// In browser console (for one user)
localStorage.removeItem("token");

// Or clear entire localStorage
localStorage.clear();
```

---

## 📱 Browser Console Commands

### Check Token
```javascript
localStorage.getItem("token")
```

### Check User State (with Redux DevTools)
```javascript
// In Redux DevTools console
$r.store.getState().user
```

### Manual Login (for testing)
```javascript
localStorage.setItem("token", "YOUR_JWT_TOKEN_HERE");
window.location.reload();
```

### Clear Auth State
```javascript
localStorage.removeItem("token");
window.location.reload();
```

---

## 🔄 State Management

### Redux User Slice
```javascript
// Initial State
{ user: null }

// Set user on login/register
dispatch(setUser({ id, firstName, lastName, email, role, ... }));

// Clear user on logout
dispatch(setUser(null));

// Access user in component
const { user } = useSelector(state => state.user);
```

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] SECRET_KEY is secure (32+ bytes)
- [ ] MONGO_URI points to production database
- [ ] CLIENT_URL points to production frontend
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Test all authentication flows
- [ ] Admin user created
- [ ] Error logging configured

---

## 🎯 Next Steps After Setup

1. **Test registration** - Create a test account
2. **Test login** - Login with test account
3. **Create admin** - Make one user admin
4. **Test admin access** - Login to admin panel
5. **Test protected routes** - Verify access control
6. **Monitor logs** - Check for errors
7. **Read full docs** - See AUTHENTICATION_GUIDE.md

---

**🎉 Quick Reference Complete!**

For detailed documentation: [README_AUTH_SYSTEM.md](README_AUTH_SYSTEM.md)
