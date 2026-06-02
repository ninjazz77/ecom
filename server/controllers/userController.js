import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionModel.js";
import { SendOTPMail } from "../emailVerify/sendOTPMail.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

const jwtSecret = process.env.SECRET_KEY || "flux-dev-secret";

const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeName = (value) => String(value || "").trim();

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const requestOrigin = req.headers.origin;
    const normalizedFirstName = normalizeName(firstName);
    const normalizedLastName = normalizeName(lastName);
    const normalizedEmail = normalizeEmail(email);

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and save token separately (so we can control what is returned)
    const newUser = await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // create short-lived registration token
    const token = jwt.sign({ id: newUser._id }, jwtSecret, {
      expiresIn: "10m",
    });

    newUser.token = token;
    await newUser.save();

    try {
      console.log("Attempting to send verification email to:", normalizedEmail);
      const mailResult = await verifyEmail(
        token,
        normalizedEmail,
        requestOrigin,
      );
      if (!mailResult?.success) {
        throw new Error("Verification email could not be sent");
      }
      console.log(
        "✅ Verification email sent successfully to:",
        normalizedEmail,
      );
    } catch (mailErr) {
      console.error("❌ verifyEmail error:", mailErr?.message || mailErr);
      console.error("Full error details:", {
        message: mailErr.message,
        code: mailErr.code,
        command: mailErr.command,
        stack: mailErr.stack?.split("\n").slice(0, 3).join("\n"),
      });

      // Provide more specific error message to user
      let userMessage =
        "Account created, but the verification email could not be delivered. Please use resend verification.";

      if (
        mailErr.message?.includes("Authentication failed") ||
        mailErr.code === "EAUTH"
      ) {
        userMessage =
          "Account created, but email service authentication failed. Please contact support or use resend verification.";
      } else if (
        mailErr.message?.includes("connect") ||
        mailErr.code === "ESOCKET"
      ) {
        userMessage =
          "Account created, but cannot connect to email server. Please use resend verification.";
      } else if (
        mailErr.message?.includes("timeout") ||
        mailErr.code === "ETIMEDOUT"
      ) {
        userMessage =
          "Account created, but email server connection timed out. Please use resend verification.";
      }

      return res.status(201).json({
        success: true,
        message: userMessage,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isBlocked: newUser.isBlocked,
          isVerified: newUser.isVerified || false,
        },
        verificationEmailSent: false,
        errorDetails:
          process.env.NODE_ENV === "development" ? mailErr.message : undefined,
      });
    }

    // respond without sending password or sensitive fields
    const safeUser = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      isBlocked: newUser.isBlocked,
      isVerified: newUser.isVerified || false,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Verification email sent.",
      user: safeUser,
      verificationEmailSent: true,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in registering user",
      error: error.message,
    });
  }
};

/**
 * Verify registration token
 */
export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const token = tokenFromHeader || req.body.token || req.query.token;

    console.log("Verification attempt:", {
      hasAuthHeader: !!authHeader,
      hasTokenFromHeader: !!tokenFromHeader,
      hasBodyToken: !!req.body.token,
      hasQueryToken: !!req.query.token,
      tokenLength: token?.length,
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token is missing. Please use the link provided in your email or request a new verification email.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log("Token decoded successfully:", { userId: decoded.id });
    } catch (error) {
      console.error("Token verification failed:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message:
            "The verification token has expired. Please request a new verification email.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed: invalid token",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("User not found for decoded ID:", decoded.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", {
      email: user.email,
      isVerified: user.isVerified,
      hasStoredToken: !!user.token,
    });

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified. You can login now.",
      });
    }

    if (!user.token || user.token !== token) {
      console.error("Token mismatch:", {
        hasStoredToken: !!user.token,
        tokensMatch: user.token === token,
      });
      return res.status(400).json({
        success: false,
        message:
          "Verification token is invalid or has already been used. Please request a new verification email.",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    console.log("User verified successfully:", user.email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("verify error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during verification. Please try again.",
    });
  }
};

/**
 * Re-send verification token
 */
export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const requestOrigin = req.headers.origin;
    const normalizedEmail = normalizeEmail(email);

    console.log("Resend verification request for:", normalizedEmail);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!user) {
      console.log("User not found for resend verification:", normalizedEmail);
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    if (user.isVerified) {
      console.log("User already verified:", normalizedEmail);
      return res.status(200).json({
        success: true,
        message: "Email is already verified. You can login now.",
      });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "10m",
    });

    user.token = token;
    await user.save();

    try {
      const mailResult = await verifyEmail(
        token,
        normalizedEmail,
        requestOrigin,
      );
      if (!mailResult?.success) {
        throw new Error("Failed to send verification email");
      }
      console.log(
        "Verification email resent successfully to:",
        normalizedEmail,
      );
      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully! Check your inbox.",
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      return res.status(500).json({
        success: false,
        message:
          "Failed to send verification email. Please try again later or contact support.",
      });
    }
  } catch (error) {
    console.error("reVerify error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!existingUser.isVerified) {
      console.log("Login blocked - email not verified:", normalizedEmail);
      return res.status(400).json({
        success: false,
        message:
          "Email is not verified. Please verify your inbox before logging in.",
      });
    }

    if (existingUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Contact an administrator.",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign({ id: existingUser._id }, jwtSecret, {
      expiresIn: "10d",
    });
    const refreshToken = jwt.sign({ id: existingUser._id }, jwtSecret, {
      expiresIn: "30d",
    });

    existingUser.isLoggedIn = true;
    await existingUser.save();

    // If a session exists, delete it first (so we have a single current session)
    const existingSession = await Session.findOne({ userId: existingUser._id });
    if (existingSession) {
      await Session.deleteOne({ userId: existingUser._id });
    }

    // Create a new session document
    await Session.create({ userId: existingUser._id });

    // Do not send sensitive fields back
    const safeUser = {
      id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
      isBlocked: existingUser.isBlocked,
      isVerified: existingUser.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

/**
 * Logout
 */
export const logout = async (req, res) => {
  try {
    // depending on your isAuthenticated middleware, user id might be on req.id or req.user
    const userId = req.id || req.user?.id || req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id missing from request",
      });
    }

    await Session.deleteOne({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in logout",
    });
  }
};

/**
 * Forgot password (send OTP)
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    try {
      await SendOTPMail(otp, normalizedEmail);
    } catch (mailErr) {
      console.error("SendOTPMail error:", mailErr?.message || mailErr);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in forgot password",
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const normalizedEmail = normalizeEmail(req.params.email);

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP generated. Please request a new one.",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in verifying OTP",
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(req.params.email);
    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in changing password",
    });
  }
};

/**
 * Get all users (admin)
 */
export const allUser = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry -token");
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("allUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching users",
    });
  }
};

/**
 * Get user by id
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params; // fixed
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in params",
      });
    }

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry -token",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching user by ID",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.id || req.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry -token",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInUser = req.user;

    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNumber,
      phoneNo,
      role,
    } = req.body;

    if (
      loggedInUser._id.toString() !== userIdToUpdate &&
      loggedInUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this user",
      });
    }

    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    // ✅ FILE UPLOAD FIXED
    if (req.file) {
      if (profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }

      const fileUri = getDataUri(req.file);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "profiles",
      });

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    // ✅ FIELD UPDATES
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.city = city || user.city;
    user.zipCode = zipCode || user.zipCode;
    user.phoneNo = phoneNumber || phoneNo || user.phoneNo;
    user.phoneNumber = phoneNumber || phoneNo || user.phoneNumber;
    user.role = role || user.role;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;

    const updatedUser = await user.save();

    const safeUser = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked,
      profilePic: updatedUser.profilePic,
      phoneNo: updatedUser.phoneNo,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      city: updatedUser.city,
      zipCode: updatedUser.zipCode,
      isVerified: updatedUser.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
