# Quick Start Guide - E-Commerce Application

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js installed
- MongoDB running
- Environment variables configured

---

## 📋 Configuration Checklist

### Server (.env)
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🏃 Running the Application

### Start Server
```bash
cd server
npm install
npm start
```
Server runs at: http://localhost:8000

### Start Client
```bash
cd client
npm install
npm run dev
```
Client runs at: http://localhost:5173

---

## 👤 Default Admin Account

**To create an admin user:**

Option 1: Register and manually update in MongoDB
```javascript
// In MongoDB, update a user document:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Option 2: Use the provided script (if available)
```bash
cd server
node create-admin.js
```

**Example Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

---

## 🎯 Quick Access URLs

### User/Customer Pages
- **Home**: http://localhost:5173/
- **Products**: http://localhost:5173/products
- **Cart**: http://localhost:5173/cart
- **Login**: http://localhost:5173/login
- **Signup**: http://localhost:5173/signup
- **Profile**: http://localhost:5173/profile/:userId

### Admin Pages
- **Admin Login**: http://localhost:5173/admin-login
- **Admin Dashboard**: http://localhost:5173/admin
- **Products Management**: http://localhost:5173/admin/products
- **Categories**: http://localhost:5173/admin/categories
- **Orders**: http://localhost:5173/admin/orders
- **Customers**: http://localhost:5173/admin/customers
- **Coupons**: http://localhost:5173/admin/coupons
- **Reviews**: http://localhost:5173/admin/reviews
- **Promotions**: http://localhost:5173/admin/promotions
- **Media**: http://localhost:5173/admin/media
- **Reports**: http://localhost:5173/admin/reports
- **Settings**: http://localhost:5173/admin/settings

### API Health Check
- http://localhost:8000/health

---

## 🛠️ Common Operations

### How to Add a Product (Admin)
1. Login as admin at `/admin-login`
2. Navigate to `/admin/products`
3. Click "Add Product" button
4. Fill in required fields:
   - Product Name ✅
   - Description ✅
   - Price ✅
   - Category ✅
   - Brand ✅
   - Stock (optional, default 0)
5. Upload images (1-10)
6. Toggle Featured/Active as needed
7. Click "Save"
8. ✅ Product created!

### How to Edit a Product (Admin)
1. Go to `/admin/products`
2. Find product in list
3. Click "Edit" button
4. Modify fields as needed
5. Click "Update"
6. ✅ Product updated!

### How to Delete a Product (Admin)
1. Go to `/admin/products`
2. Find product in list
3. Click "Delete" button
4. Confirm deletion
5. ✅ Product deleted!

### How to Add to Cart (User)
1. Login at `/login`
2. Browse products at `/products`
3. Click "Add to Cart" on any product
4. ✅ Product added to cart!

### How to View Cart (User)
1. Click cart icon in navbar
2. Or navigate to `/cart`
3. ✅ See all cart items!

### How to Checkout (User)
1. Go to `/cart`
2. Enter shipping address
3. Click "Place Order"
4. ✅ Order created!

### How to View Orders (User)
1. Go to profile page `/profile/:userId`
2. Navigate to orders tab
3. ✅ See all your orders!

### How to Manage Orders (Admin)
1. Go to `/admin/orders`
2. Click on an order
3. Update status
4. ✅ Order status updated!

---

## 🔑 API Endpoints Reference

### Authentication
```
POST   /api/v1/user/register      - Register new user
POST   /api/v1/user/login         - Login (user or admin)
POST   /api/v1/user/logout        - Logout
GET    /api/v1/user/me            - Get current user
```

### Products
```
GET    /api/v1/product/getallproducts           - List products
POST   /api/v1/product/add                      - Create product (admin)
PUT    /api/v1/product/update/:productId        - Update product (admin)
DELETE /api/v1/product/delete/:productId        - Delete product (admin)
```

### Cart
```
GET    /api/v1/cart                - Get user cart
POST   /api/v1/cart/add            - Add to cart
PUT    /api/v1/cart/update         - Update quantity
DELETE /api/v1/cart/remove         - Remove from cart
```

### Orders
```
POST   /api/v1/order/checkout         - Create order from cart
GET    /api/v1/order/my-orders        - Get user orders
GET    /api/v1/order/all-orders       - Get all orders (admin)
PUT    /api/v1/order/status/:orderId  - Update order status (admin)
```

### Categories
```
GET    /api/v1/category/all              - List categories
POST   /api/v1/category/add              - Create category (admin)
PUT    /api/v1/category/update/:id       - Update category (admin)
DELETE /api/v1/category/delete/:id       - Delete category (admin)
```

### Admin
```
GET    /api/v1/admin/overview     - Dashboard metrics
GET    /api/v1/admin/reports      - Analytics reports
GET    /api/v1/user/all-user      - List all users (admin)
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register User
```http
POST http://localhost:8000/api/v1/user/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```http
POST http://localhost:8000/api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "token": "eyJhbGc..."
}
```

**Copy the token for next requests!**

### 3. Add Product (Admin Only)
```http
POST http://localhost:8000/api/v1/product/add
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

productName: "iPhone 15 Pro"
productDesc: "Latest iPhone model"
productPrice: 99999
category: "Electronics"
brand: "Apple"
stock: 50
isFeatured: true
isActive: true
files: [select image files]
```

### 4. Get All Products
```http
GET http://localhost:8000/api/v1/product/getallproducts
```

### 5. Add to Cart
```http
POST http://localhost:8000/api/v1/cart/add
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 1
}
```

### 6. Get Cart
```http
GET http://localhost:8000/api/v1/cart
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. Checkout
```http
POST http://localhost:8000/api/v1/order/checkout
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, Country"
}
```

---

## 🔧 Troubleshooting

### Issue: Can't add to cart
**Solutions:**
1. Check if logged in (token in localStorage)
2. Check browser console for errors
3. Verify server is running
4. Check network tab in DevTools
5. Verify product has stock > 0
6. Verify product is active

### Issue: Admin dashboard not loading
**Solutions:**
1. Verify logged in as admin user
2. Check user role in MongoDB (should be "admin")
3. Clear browser cache and localStorage
4. Check browser console for errors
5. Verify token is valid

### Issue: Images not uploading
**Solutions:**
1. Check Cloudinary credentials in `.env`
2. Verify file size < 10MB
3. Check file format (jpg, png, webp)
4. Check server logs for errors
5. Verify multer middleware configured

### Issue: MongoDB connection error
**Solutions:**
1. Verify MongoDB is running
2. Check `MONGO_URI` in `.env`
3. Check MongoDB logs
4. Verify network connectivity
5. Check database permissions

### Issue: CORS errors
**Solutions:**
1. Verify `CLIENT_URL` in server `.env`
2. Check CORS configuration in `server.js`
3. Ensure `withCredentials: true` in API config
4. Clear browser cache

---

## 📊 Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  isBlocked: Boolean,
  profilePic: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  productName: String,
  productDesc: String,
  productPrice: Number,
  category: String,
  brand: String,
  stock: Number,
  productImg: [{ url: String, public_id: String }],
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  shippingFee: Number,
  totalAmount: Number,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  paymentStatus: "pending" | "paid" | "failed",
  shippingAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + Redux Persist
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Shadcn-inspired
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **CORS**: cors middleware

---

## 📝 Environment Variables Explained

### Server
- `PORT` - Server port (default: 8000)
- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - JWT signing secret (keep private!)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

### Client
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_API_URL` - Alternative backend URL

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Update all environment variables for production
- [ ] Change `SECRET_KEY` to strong random string
- [ ] Update `CLIENT_URL` to production domain
- [ ] Update `VITE_API_BASE_URL` to production API
- [ ] Set `NODE_ENV=production`
- [ ] Test all features in production-like environment
- [ ] Check all API endpoints
- [ ] Verify CORS settings
- [ ] Test with production database
- [ ] Enable rate limiting
- [ ] Review security headers
- [ ] Optimize images
- [ ] Run build: `npm run build`
- [ ] Test build locally: `npm run preview`

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, Render, or AWS EC2
- **Database**: MongoDB Atlas (recommended)
- **Images**: Cloudinary (already configured)

---

## 💡 Pro Tips

1. **Use Redux DevTools** - Install browser extension to inspect state
2. **Check Network Tab** - See all API requests and responses
3. **Use Console Logs** - Server logs show detailed errors
4. **Clear Cache** - If something's not updating, clear cache
5. **Check MongoDB** - Use MongoDB Compass to inspect database
6. **Test as User First** - Before testing admin, test user flows
7. **Use Postman Collections** - Save requests for quick testing
8. **Keep .env.example Updated** - Document required variables
9. **Test on Multiple Browsers** - Chrome, Firefox, Safari
10. **Test Responsive** - Use DevTools device mode

---

## 🆘 Support & Resources

### Documentation
- React: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- Express: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Cloudinary: https://cloudinary.com/documentation

### Community
- Stack Overflow
- GitHub Issues
- Discord communities
- Reddit r/reactjs, r/node

---

## 📄 File Structure Overview

```
e_com/
├── client/                    # Frontend React app
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # UI components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   ├── redux/           # Redux store and slices
│   │   ├── lib/             # Utilities (API, utils)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies
│
├── server/                   # Backend Express app
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, upload middleware
│   ├── utils/               # Utilities (cloudinary, etc)
│   ├── database/            # DB connection
│   ├── server.js            # Entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies
│
├── CRITICAL_FIXES_APPLIED.md   # This document
├── TESTING_CHECKLIST.md        # Testing guide
└── README.md                   # Project overview
```

---

## 🎯 Next Steps

1. ✅ Run the application
2. ✅ Create admin account
3. ✅ Test all cart functionality
4. ✅ Test admin dashboard
5. ✅ Add sample products
6. ✅ Test complete user journey
7. ✅ Review TESTING_CHECKLIST.md
8. ✅ Read CRITICAL_FIXES_APPLIED.md
9. ✅ Deploy to production
10. ✅ Monitor and maintain

---

**Happy Coding! 🚀**

*Quick Start Guide v1.0 - June 3, 2026*
