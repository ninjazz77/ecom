import User from "../models/userModel.js";

import jwt from "jsonwebtoken";

const jwtSecret = process.env.SECRET_KEY;

if (!jwtSecret) {
  console.error("CRITICAL: SECRET_KEY environment variable is not set!");
  console.error("Please set SECRET_KEY in your .env file before starting the server.");
  process.exit(1);
}

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization Token missing or invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token has expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Access Token Verification Failed Invalid Token",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // Check if session is active
    const { Session } = await import("../models/sessionModel.js");
    const activeSession = await Session.findOne({
      userId: user._id,
      accessToken: token,
      isActive: true,
    });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: "Session has been invalidated. Please login again.",
      });
    }

    req.user = user;
    req.id = user.id;
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized, Admins only" });
  }
};
