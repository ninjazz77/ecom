# Testing Checklist - E-Commerce Application

Use this checklist to verify all fixes are working correctly.

---

## 🛒 Cart Functionality Tests

### Test 1: Add to Cart from Product Grid
- [ ] Go to `/products`
- [ ] Ensure you are logged in (if not, login at `/login`)
- [ ] Click "Add to Cart" on any product
- [ ] **Expected**: See success toast "Added to cart ✨"
- [ ] **Expected**: Cart count in navbar increases
- [ ] Verify in Redux DevTools: cart state updated

### Test 2: Add to Cart from Product Details
- [ ] Click on any product card to open details modal
- [ ] Adjust quantity using +/- buttons
- [ ] Click "Add to Cart"
- [ ] **Expected**: Success toast with quantity
- [ ] **Expected**: Cart count updates correctly

### Test 3: View Cart Page
- [ ] Click cart icon in navbar
- [ ] **Expected**: Navigate to `/cart`
- [ ] **Expected**: All added products are displayed
- [ ] **Expected**: Product images, names, prices shown correctly
- [ ] **Expected**: Quantity controls visible
- [ ] **Expected**: Subtotal and total calculated correctly

### Test 4: Update Cart Quantity
- [ ] In cart page, click + button on an item
- [ ] **Expected**: Quantity increases
- [ ] **Expected**: Line total updates
- [ ] **Expected**: Cart total updates
- [ ] Click - button
- [ ] **Expected**: Quantity decreases (minimum 1)
- [ ] Try to exceed stock
- [ ] **Expected**: Error toast "Only X items available"

### Test 5: Remove from Cart
- [ ] In cart page, click trash icon on an item
- [ ] **Expected**: Item removed immediately
- [ ] **Expected**: Cart total recalculates
- [ ] **Expected**: Success toast "Item removed"

### Test 6: Empty Cart Handling
- [ ] Remove all items from cart
- [ ] **Expected**: Empty cart message displayed
- [ ] **Expected**: "Browse Products" button shown
- [ ] **Expected**: Cart count shows 0

### Test 7: Cart Persistence (Page Refresh)
- [ ] Add items to cart
- [ ] Refresh the page (F5)
- [ ] **Expected**: Cart items still present
- [ ] **Expected**: Quantities preserved

### Test 8: Cart Persistence (Logout/Login)
- [ ] Add items to cart
- [ ] Logout
- [ ] Login again
- [ ] **Expected**: Cart items restored
- [ ] **Expected**: All quantities correct

### Test 9: Checkout Process
- [ ] Go to cart with items
- [ ] Enter shipping address
- [ ] Click "Place Order" or "Checkout"
- [ ] **Expected**: Success toast "Order placed successfully! 🎉"
- [ ] **Expected**: Cart emptied
- [ ] **Expected**: Order appears in profile/orders

---

## 👨‍💼 Admin Access Tests

### Test 10: Admin Login Link Visibility
- [ ] **When NOT logged in**:
  - [ ] Check navbar - "Admin" link visible
  - [ ] Check footer - "Admin Login" link visible
- [ ] **When logged in as regular user**:
  - [ ] Check navbar - "Admin" link should NOT be visible
- [ ] **When logged in as admin**:
  - [ ] Check navbar - "Admin Dashboard" link visible instead

### Test 11: Admin Login Access
- [ ] Click "Admin Login" link in navbar or footer
- [ ] **Expected**: Navigate to `/admin-login`
- [ ] **Expected**: Login form displayed

### Test 12: Admin Authentication
- [ ] Enter admin email and password
- [ ] Click "Login" or submit
- [ ] **Expected**: Success toast "Admin access granted"
- [ ] **Expected**: Redirect to `/admin` dashboard
- [ ] **Expected**: Dashboard loads with metrics

### Test 13: Admin Role Protection
- [ ] Try to login with regular user account at `/admin-login`
- [ ] **Expected**: Error toast "Admin access required"
- [ ] **Expected**: NOT redirected to dashboard

### Test 14: Direct Admin URL Access
- [ ] Logout completely
- [ ] Try to access `/admin` directly
- [ ] **Expected**: Redirect to `/admin-login`
- [ ] Login as regular user
- [ ] Try to access `/admin` directly
- [ ] **Expected**: Redirect to home page `/`

---

## 🎛️ Admin Dashboard Tests

### Test 15: Dashboard Overview
- [ ] Login as admin
- [ ] Go to `/admin`
- [ ] **Expected**: Dashboard displayed with:
  - [ ] Revenue metric
  - [ ] Products count
  - [ ] Orders count
  - [ ] Customers count
  - [ ] Recent activity list
  - [ ] Charts (if configured)

### Test 16: Dashboard Navigation
- [ ] Click on each section in sidebar:
  - [ ] Dashboard
  - [ ] Products
  - [ ] Categories
  - [ ] Orders
  - [ ] Customers
  - [ ] Coupons
  - [ ] Reviews
  - [ ] Promotions
  - [ ] Media
  - [ ] Reports
  - [ ] Settings
- [ ] **Expected**: Each section loads without errors
- [ ] **Expected**: URL changes to `/admin/:section`

### Test 17: Responsive Sidebar (Mobile)
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Expected**: Sidebar collapses
- [ ] **Expected**: Hamburger menu appears
- [ ] Click hamburger
- [ ] **Expected**: Sidebar slides in
- [ ] Click outside or close
- [ ] **Expected**: Sidebar slides out

---

## 📦 Product Management Tests

### Test 18: Create Product
- [ ] Go to `/admin/products`
- [ ] Click "Add Product" or similar button
- [ ] Fill in form:
  - [ ] Product Name: "Test Product"
  - [ ] Description: "Test description"
  - [ ] Price: "999"
  - [ ] Category: "Electronics"
  - [ ] Brand: "TestBrand"
  - [ ] Stock: "10"
- [ ] Upload 1-3 images
- [ ] Toggle "Featured" on
- [ ] Click "Save"
- [ ] **Expected**: Success toast "Product added successfully"
- [ ] **Expected**: Product appears in list
- [ ] **Expected**: Form resets

### Test 19: View Products List
- [ ] Go to `/admin/products`
- [ ] **Expected**: All products listed
- [ ] **Expected**: Each product shows:
  - [ ] Image thumbnail
  - [ ] Name
  - [ ] Price
  - [ ] Stock
  - [ ] Category
  - [ ] Status badges (featured/active)
  - [ ] Action buttons (edit/delete)

### Test 20: Search Products
- [ ] In products section, use search box
- [ ] Type product name or category
- [ ] **Expected**: List filters in real-time
- [ ] **Expected**: Matching products shown

### Test 21: Update/Edit Product
- [ ] Click "Edit" button on a product
- [ ] **Expected**: Form populates with product data
- [ ] Modify some fields (name, price, stock)
- [ ] Click "Save" or "Update"
- [ ] **Expected**: Success toast "Product updated"
- [ ] **Expected**: Changes reflected in list
- [ ] Verify product on frontend `/products`
- [ ] **Expected**: Changes visible to users

### Test 22: Delete Product
- [ ] Click "Delete" button on a product
- [ ] **Expected**: Confirmation dialog appears
- [ ] Click "Confirm" or "Yes"
- [ ] **Expected**: Success toast "Product deleted"
- [ ] **Expected**: Product removed from list
- [ ] Check `/products` page
- [ ] **Expected**: Product no longer visible

### Test 23: Toggle Product Active Status
- [ ] Find the Active/Inactive toggle on a product
- [ ] Toggle it off (deactivate)
- [ ] **Expected**: Success toast
- [ ] Go to `/products` (user view)
- [ ] **Expected**: Product should NOT appear (or marked as unavailable)
- [ ] Return to admin, toggle it on
- [ ] **Expected**: Product visible again on frontend

### Test 24: Toggle Featured Status
- [ ] Toggle "Featured" on a product
- [ ] **Expected**: Success toast
- [ ] Go to home page `/`
- [ ] **Expected**: Product appears in "Featured" section
- [ ] Toggle featured off
- [ ] **Expected**: Product removed from featured section

### Test 25: Bulk Actions
- [ ] Select multiple products (checkboxes)
- [ ] Choose bulk action dropdown
- [ ] Select "Deactivate" or "Delete"
- [ ] Confirm action
- [ ] **Expected**: Success toast
- [ ] **Expected**: All selected products affected

### Test 26: Product Image Upload
- [ ] Create or edit product
- [ ] Upload 1 image
- [ ] **Expected**: Image preview shown
- [ ] Upload up to 10 images total
- [ ] **Expected**: All previews shown
- [ ] Try to upload 11th image
- [ ] **Expected**: Error "Maximum 10 images"
- [ ] Save product
- [ ] **Expected**: Images uploaded to Cloudinary
- [ ] Check product on frontend
- [ ] **Expected**: All images displayed in gallery

---

## 🏷️ Category Management Tests

### Test 27: Create Category
- [ ] Go to `/admin/categories`
- [ ] Click "Add Category"
- [ ] Fill in:
  - [ ] Name: "Test Category"
  - [ ] Description: "Test description"
- [ ] Click "Save"
- [ ] **Expected**: Success toast "Category created"
- [ ] **Expected**: Category appears in list

### Test 28: Edit/Delete Category
- [ ] Click "Edit" on a category
- [ ] Modify name or description
- [ ] Save
- [ ] **Expected**: Success toast
- [ ] Click "Delete" on a category
- [ ] Confirm
- [ ] **Expected**: Category removed

---

## 👥 Customer Management Tests

### Test 29: View Customers List
- [ ] Go to `/admin/customers`
- [ ] **Expected**: All users listed with:
  - [ ] Name
  - [ ] Email
  - [ ] Role (user/admin)
  - [ ] Status (blocked/active)

### Test 30: Block/Unblock User
- [ ] Find a user in list
- [ ] Click "Block" button
- [ ] **Expected**: Success toast
- [ ] **Expected**: User marked as blocked
- [ ] Try to login with that user account
- [ ] **Expected**: Error "Account has been blocked"
- [ ] Unblock the user
- [ ] **Expected**: User can login again

---

## 📋 Orders Management Tests

### Test 31: View Orders List
- [ ] Go to `/admin/orders`
- [ ] **Expected**: All orders listed with:
  - [ ] Order ID
  - [ ] Customer name/email
  - [ ] Total amount
  - [ ] Status
  - [ ] Date

### Test 32: Update Order Status
- [ ] Click on an order or "Edit"
- [ ] Change status (e.g., "pending" → "processing")
- [ ] Save
- [ ] **Expected**: Success toast
- [ ] **Expected**: Status updated in list

---

## 🔍 Edge Cases Tests

### Test 33: Stock Validation
- [ ] Find a product with stock = 2
- [ ] Add 1 to cart
- [ ] Try to increase quantity to 3
- [ ] **Expected**: Error toast "Only 2 items available"

### Test 34: Inactive Product in Cart
- [ ] Add product to cart
- [ ] As admin, deactivate that product
- [ ] Refresh cart page
- [ ] **Expected**: Product marked as unavailable
- [ ] Try to checkout
- [ ] **Expected**: Error or product auto-removed

### Test 35: Session Expiration
- [ ] Login
- [ ] Wait for token expiration (if configured) OR manually delete token from localStorage
- [ ] Try to perform authenticated action (add to cart)
- [ ] **Expected**: Redirect to login OR error "Token expired"

### Test 36: Network Error Handling
- [ ] Disconnect internet
- [ ] Try to add product to cart
- [ ] **Expected**: Error toast "Network error. Check your internet connection"
- [ ] Reconnect internet
- [ ] Try again
- [ ] **Expected**: Operation succeeds

### Test 37: Price = 0 Validation
- [ ] As admin, try to create product with price = 0
- [ ] **Expected**: Error "Price must be > 0"

### Test 38: Negative Stock Validation
- [ ] Try to create product with stock = -5
- [ ] **Expected**: Error "Stock must be >= 0"

### Test 39: Empty Required Fields
- [ ] Try to create product without name
- [ ] **Expected**: Error "Product name required"
- [ ] Try without category
- [ ] **Expected**: Error "Category required"
- [ ] Try without brand
- [ ] **Expected**: Error "Brand required"

---

## 🎨 UI/UX Tests

### Test 40: Loading States
- [ ] During any async operation (add to cart, save product, etc.)
- [ ] **Expected**: Loading spinner or disabled button
- [ ] **Expected**: Button text changes (e.g., "Adding…", "Saving…")

### Test 41: Success Notifications
- [ ] Perform any successful operation
- [ ] **Expected**: Green toast appears
- [ ] **Expected**: Toast auto-dismisses after a few seconds

### Test 42: Error Notifications
- [ ] Trigger any error (e.g., network error, validation error)
- [ ] **Expected**: Red/error toast appears
- [ ] **Expected**: Clear error message displayed

### Test 43: Empty States
- [ ] View cart with no items
- [ ] **Expected**: Empty cart message with icon
- [ ] View products with no results (use search that matches nothing)
- [ ] **Expected**: "No products found" message

### Test 44: Responsive Design - Mobile
- [ ] Resize browser to mobile width (375px)
- [ ] **Expected**: All pages render correctly
- [ ] **Expected**: Mobile menu works
- [ ] **Expected**: Forms are usable
- [ ] **Expected**: Buttons are touchable
- [ ] **Expected**: No horizontal scroll

### Test 45: Responsive Design - Tablet
- [ ] Resize to tablet width (768px)
- [ ] **Expected**: Layout adapts appropriately
- [ ] **Expected**: Grid columns adjust

### Test 46: Responsive Design - Desktop
- [ ] View at full desktop width (1920px)
- [ ] **Expected**: Content centered with max-width
- [ ] **Expected**: Multi-column grids displayed

---

## 🔒 Security Tests

### Test 47: Unauthorized API Access
- [ ] Logout completely
- [ ] Open browser console
- [ ] Try to call admin API directly: 
   ```javascript
   fetch('http://localhost:8000/api/v1/product/add', {method:'POST'})
   ```
- [ ] **Expected**: 401 Unauthorized error

### Test 48: Non-Admin Dashboard Access
- [ ] Login as regular user
- [ ] Try to access `/admin` directly
- [ ] **Expected**: Redirect to home page
- [ ] Try to call admin API from console
- [ ] **Expected**: 403 Forbidden error

### Test 49: XSS Prevention (Basic)
- [ ] Try to create product with name: `<script>alert('XSS')</script>`
- [ ] Save product
- [ ] View product on frontend
- [ ] **Expected**: Script tag displayed as text, not executed

### Test 50: SQL Injection Prevention (Basic)
- [ ] Try to login with email: `admin@test.com' OR '1'='1`
- [ ] **Expected**: Login fails (no SQL injection)

---

## ✅ Final Verification

After completing all tests above:

- [ ] No console errors in browser
- [ ] All CRUD operations working
- [ ] All user flows complete successfully
- [ ] All admin features functional
- [ ] Responsive design working across devices
- [ ] Error handling working correctly
- [ ] Loading states implemented
- [ ] Success/error notifications working
- [ ] Data persists correctly in database
- [ ] Images upload and display correctly

---

## 🐛 Bug Reporting Template

If you find any issues during testing, report them using this format:

**Test Number**: [e.g., Test 18]  
**Issue**: [Brief description]  
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]  
**Actual Result**: [What actually happened]  
**Screenshot**: [If applicable]  
**Browser/Device**: [e.g., Chrome 115, Windows 11]  
**Severity**: [Critical/High/Medium/Low]

---

## 📊 Testing Summary

Total Tests: 50

After completing all tests, fill in:
- Tests Passed: ___
- Tests Failed: ___
- Tests Skipped: ___
- Success Rate: ___%

---

*Testing Checklist Version: 1.0*  
*Date: June 3, 2026*
