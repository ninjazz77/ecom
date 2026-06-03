import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

const JWT_SECRET = process.env.SECRET_KEY;
const JWT_EXPIRES_IN = "30d"; // 30 days

if (!JWT_SECRET) {
  console.error("CRITICAL: SECRET_KEY is not set in environment variables!");
  process.exit(1);
}

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route   POST /api/v1/user/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isBlocked: user.isBlocked,
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to Flux.",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/v1/user/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isBlocked: user.isBlocked,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      phoneNo: user.phoneNo,
      address: user.address,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/v1/user/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/v1/user/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isBlocked: user.isBlocked,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      phoneNo: user.phoneNo,
      address: user.address,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/v1/user/update/:id
 * @desc    Update user profile
 * @access  Private
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, city, state, zipCode, phoneNo, address } =
      req.body;

    // Verify user is updating their own profile or is admin
    if (req.userId !== id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (city !== undefined) user.city = city.trim();
    if (state !== undefined) user.state = state.trim();
    if (zipCode !== undefined) user.zipCode = zipCode.trim();
    if (phoneNo !== undefined) user.phoneNo = phoneNo.trim();
    if (address !== undefined) user.address = address;

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture from cloudinary if exists
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      }

      // Upload new profile picture
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "flux/profiles",
      });

      user.profilePic = cloudResponse.secure_url;
      user.profilePicPublicId = cloudResponse.public_id;
    }

    await user.save();

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      phoneNo: user.phoneNo,
      address: user.address,
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/v1/user/all-user
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
export const allUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/v1/user/get-user/:userId
 * @desc    Get user by ID
 * @access  Public
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    };

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/v1/user/block-user/:userId
 * @desc    Block user (Admin only)
 * @access  Private/Admin
 */
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot block an admin user",
      });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("Block user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/v1/user/unblock-user/:userId
 * @desc    Unblock user (Admin only)
 * @access  Private/Admin
 */
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock user",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/v1/user/change-role/:userId
 * @desc    Change user role (Admin only)
 * @access  Private/Admin
 */
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role changed to ${role} successfully`,
    });
  } catch (error) {
    console.error("Change user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change user role",
      error: error.message,
    });
  }
};
