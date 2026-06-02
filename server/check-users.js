import mongoose from "mongoose";
import User from "./models/userModel.js";
import "dotenv/config";

const checkUsers = async () => {
  try {
    console.log("Connecting to database...");
    console.log("MONGO_URI:", process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connected to database\n");
    
    const users = await User.find().select("firstName lastName email isVerified isBlocked role createdAt");
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("\nTo create a test user, you need to:");
      console.log("1. Go to signup page: http://localhost:5173/signup");
      console.log("2. Create an account");
      console.log("3. Verify your email (or manually set isVerified: true in database)");
    } else {
      console.log("Users in database:");
      console.log("==================");
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Blocked: ${user.isBlocked ? '⛔ Yes' : '✅ No'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
      });
      
      const unverifiedUsers = users.filter(u => !u.isVerified);
      if (unverifiedUsers.length > 0) {
        console.log(`\n⚠️  ${unverifiedUsers.length} user(s) not verified yet`);
        console.log("These users cannot login until verified.");
      }
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkUsers();
