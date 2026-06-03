# Authentication System Documentation

## Overview

This e-commerce application uses a **clean, simple JWT-based authentication system** with no email verification, OTP, or session management complexity. Users can register, login, and stay authenticated seamlessly.

---

## Features

✅ **User Registration** - Create new accounts with email and password  
✅ **User Login** - Secure authentication with JWT tokens  
✅ **User Logout** - Clean session termination  
✅ **Protected Routes** - Role-based access control (user/admin)  
✅ **Password Hashing** - bcrypt with salt rounds  
✅ **JWT Tokens** - 30-day expiration  
✅ **Form Validation** - Client and server-side  
✅ **Error Handling** - Clear, user-friendly messages  
✅ **Session Persistence** - Auto-restore on page reload  
✅ **Admin Panel** - Separate login for admin users  

---

## Architecture

### Backend (Server)

**Technology Stack:**
- Node.js + Express.js
- MongoDB + Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)

**Key Files:**
```
server/
├── controllers/userController.js    # Auth logic (register, login, logout, etc.)
├── models/userModel.js              # User schema
├── middleware/isAuthenticated.js    # JWT verification middleware
├── routes/userRoute.js              # Auth routes
└── .env                             # JWT secret & config
```

### Frontend (Client)

**Technology Stack:**
- React + Vite
- Redux Toolkit (state management)
- React Router (routing)
- Axios (API calls)
- Sonner (toast notifications)

**Key Files:**
```
client/src/
├── pages/
│   ├── Login.jsx                    # Login page
│   ├── Signup.jsx                   # Registration page
│   └── AdminLogin.jsx               # Admin login
├── components/
│   └── ProtectedRoute.jsx           # Route protection
├── redux/
│   └── userSlice.js                 # User state management
├── lib/api.js                       # Axios configuration
└── App.jsx                          # Session restoration
```

---

## API Endpoints

### Public Routes

#### 1. Register User
```http
POST /api/v1/user/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201 Created):
{
  "success": true,
  "message": "Registration successful! Welcome to Flux.",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePic": "",
    "isBlocked": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login User
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Routes

All protected routes require JWT token in Authorization header:
```http
Authorization: Bearer <token>
```

#### 3. Get Current User
```http
GET /api/v1/user/me
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePic": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "phoneNo": "",
    "address": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Logout User
```http
POST /api/v1/user/logout
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Logout successful"
}
```

#### 5. Update User Profile
```http
PUT /api/v1/user/update/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "firstName": "John",
  "lastName": "Doe",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "phoneNo": "1234567890",
  "address": ["123 Main St"],
  "profilePic": <file>
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Admin Routes

#### 6. Get All Users (Admin Only)
```http
GET /api/v1/user/all-user
Authorization: Bearer <admin-token>

Response (200 OK):
{
  "success": true,
  "users": [...],
  "count": 10
}
```

#### 7. Block User (Admin Only)
```http
PUT /api/v1/user/block-user/:userId
Authorization: Bearer <admin-token>

Response (200 OK):
{
  "success": true,
  "message": "User blocked successfully"
}
```

#### 8. Unblock User (Admin Only)
```http
PUT /api/v1/user/unblock-user/:userId
Authorization: Bearer <admin-token>

Response (200 OK):
{
  "success": true,
  "message": "User unblocked successfully"
}
```

#### 9. Change User Role (Admin Only)
```http
PUT /api/v1/user/change-role/:userId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin"
}

Response (200 OK):
{
  "success": true,
  "message": "User role changed to admin successfully"
}
```

---

## Authentication Flow

### 1. Registration Flow
```
User fills signup form
   ↓
Client validates input (email format, password length)
   ↓
POST /api/v1/user/register
   ↓
Server validates & checks existing user
   ↓
Password hashed with bcrypt (10 salt rounds)
   ↓
User created in MongoDB
   ↓
JWT token generated (30-day expiration)
   ↓
Token & user data returned to client
   ↓
Token stored in localStorage
   ↓
User data stored in Redux
   ↓
Redirect to home page
```

### 2. Login Flow
```
User fills login form
   ↓
Client validates input
   ↓
POST /api/v1/user/login
   ↓
Server finds user by email
   ↓
Password verified with bcrypt.compare()
   ↓
Check if user is blocked
   ↓
JWT token generated
   ↓
Token & user data returned
   ↓
Token stored in localStorage
   ↓
User data stored in Redux
   ↓
Cart loaded from server
   ↓
Redirect to home page
```

### 3. Session Restoration (Auto-login on page reload)
```
Page loads
   ↓
App.jsx checks for token in localStorage
   ↓
If token exists → GET /api/v1/user/me
   ↓
Server verifies JWT token
   ↓
User data returned
   ↓
User data stored in Redux
   ↓
Cart loaded
   ↓
User stays logged in
```

### 4. Protected Route Access
```
User navigates to protected route
   ↓
ProtectedRoute component checks:
  - Is token in localStorage?
  - Is user in Redux state?
  - Does user have required role?
   ↓
If checks pass → Render route
If checks fail → Redirect to login
```

### 5. API Request with Authentication
```
Client makes API request
   ↓
Axios interceptor adds:
  Authorization: Bearer <token>
   ↓
Server middleware (isAuthenticated) verifies token
   ↓
If valid → Attach user to req.user → Continue
If invalid → Return 401 Unauthorized
```

### 6. Logout Flow
```
User clicks logout
   ↓
POST /api/v1/user/logout (optional server notification)
   ↓
Remove token from localStorage
   ↓
Clear user from Redux
   ↓
Clear cart from Redux
   ↓
Redirect to login page
```

---

## Security Features

### Password Security
- **Hashing Algorithm:** bcrypt with 10 salt rounds
- **Minimum Length:** 6 characters (enforced client & server)
- **Storage:** Never stored in plain text
- **Transmission:** HTTPS recommended in production

### JWT Security
- **Secret Key:** Stored in environment variable `SECRET_KEY`
- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiration:** 30 days
- **Storage:** localStorage (client-side)
- **Transmission:** Authorization header (Bearer token)

### Validation
- **Client-side:** Email format, required fields, password length
- **Server-side:** Duplicate email check, input sanitization, role verification

### Role-Based Access Control (RBAC)
- **Roles:** `user` (default), `admin`
- **Middleware:** `isAdmin` checks user role before allowing access
- **Protected Routes:** Admin dashboard, user management, product management

### Additional Security
- **Account Blocking:** Admins can block malicious users
- **Token Expiration:** Automatic logout after 30 days
- **CORS:** Configured to allow only specific origins
- **Input Sanitization:** Trim, lowercase email, escape special characters

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Your account has been blocked. Please contact support."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Registration failed. Please try again.",
  "error": "..."
}
```

---

## Frontend State Management

### Redux User Slice
```javascript
// Initial State
{
  user: null
}

// Actions
setUser(userData)  // Set authenticated user
setUser(null)      // Clear user on logout
```

### localStorage Keys
- `token` - JWT authentication token

### Session Persistence
The application automatically restores user session on page reload by:
1. Checking for token in localStorage
2. Making GET /api/v1/user/me request
3. Restoring user data to Redux if token is valid
4. Loading user's cart
5. Handling 401 errors by clearing invalid tokens

---

## Testing the Authentication System

### 1. Test Registration
```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
# Replace <TOKEN> with actual JWT token
curl -X GET http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Test Admin Route
```bash
# Create admin user first (manually in database or use change-role endpoint)
curl -X GET http://localhost:8000/api/v1/user/all-user \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Environment Variables

Required in `server/.env`:
```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://...

# Authentication
SECRET_KEY=your-super-secret-jwt-key-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Cloudinary (for profile pictures)
CLOUD_NAME=...
API_KEY=...
API_SECRET=...
```

Required in `client/.env`:
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Troubleshooting

### Issue: "Invalid token" error
**Solution:** Token may have expired or been tampered with. Clear localStorage and login again.

### Issue: User not redirected after login
**Solution:** Check Redux state, ensure `setUser()` is called with correct user data.

### Issue: Protected routes not working
**Solution:** Verify token exists in localStorage and user exists in Redux state.

### Issue: Admin routes returning 403
**Solution:** Ensure user has `role: "admin"` in database.

### Issue: Session not persisting on page reload
**Solution:** Check `App.jsx` session restoration logic, ensure token exists in localStorage.

### Issue: CORS errors
**Solution:** Verify `CLIENT_URL` in server `.env` matches frontend URL.

---

## Best Practices

1. **Always use HTTPS in production** - JWT tokens in localStorage are vulnerable over HTTP
2. **Set short token expiration** - Current: 30 days (adjust based on security needs)
3. **Implement refresh tokens** - For better security (optional enhancement)
4. **Rate limit login attempts** - Prevent brute force attacks (optional enhancement)
5. **Log authentication events** - Monitor suspicious activity
6. **Use strong JWT secrets** - Generate with crypto.randomBytes(32).toString('hex')
7. **Validate all inputs** - Client and server-side
8. **Handle errors gracefully** - User-friendly messages, no stack traces to client
9. **Test authentication flows** - Registration, login, logout, session restore
10. **Keep dependencies updated** - Regular npm audit and updates

---

## Future Enhancements

Possible improvements to consider:

- **Refresh Tokens** - Separate short-lived access tokens + long-lived refresh tokens
- **Email Verification** - Optional email confirmation for new accounts
- **Password Reset** - Forgot password flow with email tokens
- **Two-Factor Authentication (2FA)** - SMS or authenticator app codes
- **OAuth Integration** - Google, Facebook, GitHub login
- **Account Lockout** - After multiple failed login attempts
- **Session Management** - Track active sessions, logout from all devices
- **Password Strength Meter** - Visual feedback on password quality
- **Account Deletion** - Allow users to permanently delete their accounts
- **Activity Logs** - Track user login history and IP addresses

---

## Support

If you encounter any issues with authentication:

1. Check this documentation
2. Review server logs for error details
3. Verify environment variables are set correctly
4. Test API endpoints directly with curl/Postman
5. Check browser console for client-side errors
6. Ensure MongoDB connection is working

---

**Last Updated:** June 2026  
**Version:** 2.0.0 (Complete Rebuild)
