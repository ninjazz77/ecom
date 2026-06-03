import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.SECRET_KEY;

if (!JWT_SECRET) {
  console.error("CRITICAL: SECRET_KEY is not set in environment variables!");
  process.exit(1);
}

/**
 * Middleware to verify JWT token and authenticate user
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};
