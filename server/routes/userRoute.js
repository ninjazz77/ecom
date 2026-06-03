import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateUser,
  allUser,
  getUserById,
  blockUser,
  unblockUser,
  changeUserRole,
} from "../controllers/userController.js";
import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getCurrentUser);
router.put("/update/:id", isAuthenticated, singleUpload, updateUser);

// Admin routes
router.get("/all-user", isAuthenticated, isAdmin, allUser);
router.get("/get-user/:userId", getUserById);
router.put("/block-user/:userId", isAuthenticated, isAdmin, blockUser);
router.put("/unblock-user/:userId", isAuthenticated, isAdmin, unblockUser);
router.put("/change-role/:userId", isAuthenticated, isAdmin, changeUserRole);

export default router;
