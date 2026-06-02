# Setup and Testing Guide

## 🚀 Quick Start

### 1. Environment Setup

**Backend (.env file required):**
```bash
cd server
```

Create or update `.env` file:
```env
# CRITICAL - Server won't start without this
SECRET_KEY=my_super_secure_random_secret_key_at_least_32_chars_long_abc123xyz

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Flux-DB
MONGO_FALLBACK_URI=mongodb://127.0.0.1:27017/Flux-DB

# Server
PORT=8000
NODE_ENV=development

# Frontend URLs
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
ALLOW_VERCEL_PREVIEWS=true

# Cloudinary (for image uploads)
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret

# Email (for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Flux
```

**Frontend (.env file):**
```bash
cd client
```

Create or update `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# or
node server.js
```

Expected output:
```
Server is running on port 8000
Allowed origins: [ 'http://localhost:5173' ]
MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Testing the Fixes

### Test 1: Authentication Flow

#### 1.1 Signup
1. Navigate to http://localhost:5173/signup
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: password123
3. Click "Create Account"

**Expected:**
- ✅ Success toast: "Account created! Check your email."
- ✅ Redirects to `/verify` page
- ✅ Email sent to provided address (check spam folder)

**Console Check:**
```javascript
// Backend should log:
"Attempting to send verification email to: john.doe@example.com"
"✅ Verification email sent successfully to: john.doe@example.com"
```

#### 1.2 Email Verification
1. Check your email for verification link
2. Click the link (format: `http://localhost:5173/verify/TOKEN`)
3. You'll see verification success

**OR** Use the verify page:
1. Go to http://localhost:5173/verify
2. Enter your email
3. Click "Resend Verification"

**Expected:**
- ✅ "Email verified successfully! You can now login."
- ✅ Can now proceed to login

#### 1.3 Login
1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: john.doe@example.com
   - Password: password123
3. Click "Sign In"

**Expected:**
- ✅ Success toast: "Welcome back! ✨"
- ✅ Redirects to home page
- ✅ Navbar shows user account menu
- ✅ Token stored in localStorage
- ✅ User state in Redux

**Console Check:**
```javascript
// Frontend localStorage:
localStorage.getItem('accessToken') // Should return JWT token

// Frontend Redux DevTools:
// State → user → user → should show user object
```

#### 1.4 Session Persistence
1. While logged in, refresh the page (F5)

**Expected:**
- ✅ User remains logged in
- ✅ No redirect to login
- ✅ User info still visible in navbar

**Console Check:**
```javascript
// Network tab should show:
GET /api/v1/user/me - Status 200
GET /api/v1/cart - Status 200
```

#### 1.5 Logout
1. Click the logout button in navbar (top right)

**Expected:**
- ✅ Toast: "See you soon!"
- ✅ Redirects to login page
- ✅ Token removed from localStorage
- ✅ User state cleared
- ✅ Cart state cleared

**Console Check:**
```javascript
localStorage.getItem('accessToken') // Should return null

// Try accessing protected route:
// Navigate to /cart - should redirect to /login
```

#### 1.6 Token Invalidation (Security Test)
1. Login successfully
2. Copy the token from localStorage
3. Logout
4. Manually set the old token back:
   ```javascript
   localStorage.setItem('accessToken', 'OLD_TOKEN_HERE')
   ```
5. Try to access /cart

**Expected:**
- ✅ Request fails with 401
- ✅ Redirects to login
- ✅ Message: "Session has been invalidated. Please login again."

**This proves token blacklisting works!** 🎉

---

### Test 2: Cart Functionality

#### 2.1 Add to Cart (Not Logged In)
1. Logout if logged in
2. Navigate to /products
3. Click "Add" on any product

**Expected:**
- ✅ Toast: "Sign in to add items to cart."
- ✅ Redirects to login after 800ms

#### 2.2 Add to Cart (Logged In)
1. Login first
2. Navigate to /products
3. Click "Add" on a product

**Expected:**
- ✅ Toast: "Added to cart ✨"
- ✅ Cart icon badge shows count (e.g., "1")
- ✅ No page reload

**Console Check:**
```javascript
// Network tab:
POST /api/v1/cart/add - Status 200
Response: { success: true, cart: {...} }

// Redux DevTools:
// State → product → cart → items → should have 1 item
```

#### 2.3 View Cart
1. Click cart icon in navbar
2. Navigate to /cart

**Expected:**
- ✅ Cart displays added products
- ✅ Product image, name, price shown
- ✅ Quantity controls visible
- ✅ Subtotal calculated correctly
- ✅ Shipping fee shown (₹99 or Free)
- ✅ Total calculated correctly

#### 2.4 Update Quantity
1. In cart page, click "+" button

**Expected:**
- ✅ Quantity increases
- ✅ Line total updates
- ✅ Cart total updates
- ✅ No page reload

2. Click "-" button

**Expected:**
- ✅ Quantity decreases
- ✅ Line total updates
- ✅ Minimum quantity is 1 (can't go below)

**Console Check:**
```javascript
// Network tab:
PUT /api/v1/cart/update - Status 200
Body: { productId: "...", type: "increase" }
```

#### 2.5 Stock Limits
1. Find a product with low stock (or create one in database)
2. Try to add more than available stock

**Expected:**
- ✅ Toast: "Only X item(s) available"
- ✅ Quantity doesn't increase beyond stock

#### 2.6 Remove from Cart
1. In cart page, click trash icon

**Expected:**
- ✅ Toast: "Item removed"
- ✅ Item disappears from cart
- ✅ Cart total updates
- ✅ Cart count badge updates

#### 2.7 Cart Persistence
1. Add items to cart
2. Refresh page

**Expected:**
- ✅ Cart items still visible
- ✅ Quantities preserved
- ✅ Totals correct

3. Logout
4. Login again

**Expected:**
- ✅ Cart restored with same items
- ✅ Prices synced with current product prices

#### 2.8 Price Synchronization Test
1. Add a product to cart (price ₹1000)
2. **In database**, update that product's price to ₹1200
3. In cart page, click "+" or "-" to update quantity

**Expected:**
- ✅ Cart recalculates with NEW price (₹1200)
- ✅ Line total reflects current price
- ✅ Total updates correctly

**This proves price sync works!** 🎉

---

### Test 3: Edge Cases

#### 3.1 Multiple Sessions
1. Login on Chrome
2. Copy the token
3. Login again on Firefox (or incognito)

**Expected:**
- ✅ First session invalidated
- ✅ Only latest session works
- ✅ Chrome requests fail with 401

#### 3.2 Expired Token
1. Login successfully
2. Wait 10 days (or modify JWT expiration for testing)
3. Try to access protected route

**Expected:**
- ✅ Token expired error
- ✅ Redirects to login

#### 3.3 Blocked User
1. Admin blocks a user
2. Blocked user tries to access protected route

**Expected:**
- ✅ 403 Forbidden
- ✅ Message: "Your account has been blocked"

#### 3.4 Unverified Login Attempt
1. Create account but don't verify email
2. Try to login

**Expected:**
- ✅ Error: "Email is not verified"
- ✅ Prompt to resend verification

#### 3.5 Empty Cart
1. Remove all items from cart
2. View cart page

**Expected:**
- ✅ Empty state shown
- ✅ "Your cart is empty" message
- ✅ "Browse Products" button visible

---

## 🐛 Troubleshooting

### Issue: Server won't start
**Error:** "CRITICAL: SECRET_KEY environment variable is not set!"

**Solution:**
1. Check `.env` file exists in `server/` folder
2. Verify `SECRET_KEY` is set
3. Restart server

---

### Issue: "Network error. Check your internet connection"
**Possible Causes:**
1. Backend server not running
2. Wrong `VITE_API_BASE_URL` in client `.env`
3. CORS issues

**Solution:**
```bash
# Check backend is running:
curl http://localhost:8000/health

# Should return:
{"success":true,"message":"API is healthy"}
```

---

### Issue: Email not sent
**Possible Causes:**
1. Invalid SMTP credentials
2. Gmail "Less secure apps" disabled
3. App password not generated

**Solution:**
1. For Gmail: Generate App Password
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use that password in `SMTP_PASS`
2. Update `.env` with correct credentials
3. Restart server

**Alternative:** Use Mailtrap for testing:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
```

---

### Issue: Cart not loading after login
**Check:**
1. Open browser console (F12)
2. Check Network tab
3. Look for `/api/v1/cart` request

**If 401:** Token not set correctly
**If 500:** Backend error (check server logs)
**If 404:** Cart route not registered

**Solution:**
```javascript
// In browser console:
localStorage.getItem('accessToken') // Should show token

// If empty, login again
```

---

### Issue: "Session has been invalidated"
**This is expected after:**
1. Logout
2. Login from another device/browser
3. Admin invalidated session

**Solution:** Login again

---

## 🎯 Success Criteria

All tests pass if:

✅ Signup creates user and sends email  
✅ Email verification works  
✅ Login authenticates and loads cart  
✅ Session persists on page refresh  
✅ Logout clears everything  
✅ Old tokens don't work after logout  
✅ Add to cart requires login  
✅ Cart displays items correctly  
✅ Quantity update works  
✅ Stock limits enforced  
✅ Remove from cart works  
✅ Cart persists after refresh and login  
✅ Prices sync with current product prices  

---

## 📊 Performance Checks

Use browser DevTools:

1. **Network Tab:**
   - Login should make 3 calls (login, /me, /cart)
   - Page refresh should make 2 calls (/me, /cart)
   - Add to cart should make 1 call

2. **Redux DevTools:**
   - User state updates on login
   - Cart state updates on cart operations
   - State cleared on logout

3. **Console:**
   - No errors
   - No warnings about memory leaks
   - No infinite loops

---

## 🎉 You're All Set!

If all tests pass, your authentication and cart functionality is working perfectly!

**Next Steps:**
1. Test on different browsers
2. Test on mobile devices
3. Deploy to staging environment
4. Run production tests

---

**Happy Testing!** 🚀
