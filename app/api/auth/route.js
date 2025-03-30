// import { NextResponse } from "next/server";
// // import { registerUser, login, updateProfile } from "../controllers/authController"; 
// import dbConnect from "../../lib/dbConnect";
// import User from "../../models/User";
// import bcrypt from "bcryptjs";
// import jwt from 'jsonwebtoken';


// const registerUser = async (name, email, password) => {
//   await dbConnect();

//   try {
//     console.log("Received registration data:", { name, email, password });
//     // Validate input data
//     if (!name || !email || !password) {
//       return NextResponse.json({ message: "All fields are required" }, { status: 400 });
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return NextResponse.json({ message: "User already exists" }, { status: 400 });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the new user
//     const user = await User.create({ name, email, password: hashedPassword });

//     console.log(user); // log the created user for debugging

//     // Return success response
//     return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
//   } catch (error) {
//     console.error("Error during user registration:", error);
//     return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
//   }
// };

// // Login an existing user
// const loginUser = async (email, password) => {
//   await dbConnect();

//   try {
//     // Validate input data
//     if (!email || !password) {
//       return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
//     }

//     // Compare the password with the hashed password stored in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//     // Return success response with the token and user data
//     return NextResponse.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email }
//     });
//   } catch (error) {
//     console.error("Error during user login:", error);
//     return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
//   }
// };

// // Handle POST request for both login and registration
// export async function POST(req) {
     
//   try {
//     const { action, name, email, password } = await req.json(); // action: 'register' or 'login'
//        console.log(name,"namenamename")
//     if (action === "register") {
//       return await registerUser(name, email, password); // Call register function
//     } else if (action === "login") {
//       return await loginUser(email, password); // Call login function
//     } else {
//       return NextResponse.json({ message: "Invalid action" }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("Error handling POST request:", error);
//     return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";

import mongoose from "mongoose";

let isConnected = false; // Track connection status

export const dbConnect = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {}); // No need for options in Mongoose 6+

    isConnected = mongoose.connection.readyState === 1;
    console.log("✅ MongoDB Connected!");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw new Error("Database connection failed");
  }
};

// Register User
const registerUser = async (name, email, password) => {
  const start = Date.now();
  await dbConnect(); // Use dbConnect instead of connectDB

  try {
    console.log("📩 Received registration data:", { name, email });

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 8); // Reduced salt rounds for better performance

    const user = await User.create({ name, email, password: hashedPassword });

    console.log("✅ User registered:", user);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  } finally {
    console.log(`⏳ Execution time: ${Date.now() - start}ms`);
  }
};


// Login User
const loginUser = async (email, password) => {
  const start = Date.now();
  await connectDB();

  try {
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  } finally {
    console.log(`⏳ Execution time: ${Date.now() - start}ms`);
  }
};

// Handle POST request
export async function POST(req) {
  try {
    const { action, name, email, password } = await req.json();
    console.log("📩 Request received:", { action, email });

    if (action === "register") {
      return await registerUser(name, email, password);
    } else if (action === "login") {
      return await loginUser(email, password);
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Error handling POST request:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

