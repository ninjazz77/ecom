import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import "dotenv/config";

const createTestUser = async () => {
  try {
    console.log("Connecting to database...");
    console.log("MONGO_URI:", process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connected to database\n");
    
    // Create a verified test user
    const testEmail = "test@example.com";
    const testPassword = "password123";
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log("⚠️  Test user already exists!");
      console.log(`Email: ${testEmail}`);
      console.log(`Verified: ${existingUser.isVerified}`);
      
      if (!existingUser.isVerified) {
        console.log("\n🔧 Setting user as verified...");
        existingUser.isVerified = true;
        await existingUser.save();
        console.log("✅ User is now verified!");
      }
      
      console.log("\n✅ You can now login with:");
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
    } else {
      console.log("Creating test user...");
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const newUser = await User.create({
        firstName: "Test",
        lastName: "User",
        email: testEmail,
        password: hashedPassword,
        isVerified: true, // Pre-verified for testing
        role: "user",
      });
      
      console.log("✅ Test user created successfully!\n");
      console.log("Login credentials:");
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
      console.log(`\nUser ID: ${newUser._id}`);
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 11000) {
      console.error("Duplicate key error - user already exists");
    }
    process.exit(1);
  }
};

createTestUser();
