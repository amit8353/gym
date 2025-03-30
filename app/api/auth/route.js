import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

const registerUser = async (name, email, password) => {
  await dbConnect();

  try {
    console.log("Received registration data:", { name, email, password });

    // Validate input data
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8); // Reduce salt rounds

    // Create the new user
    const user = await User.create({ name, email, password: hashedPassword });

    console.log("User created:", user); // log the created user for debugging

    // Return success response
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

const loginUser = async (email, password) => {
  await dbConnect();

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
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

export async function POST(req) {
  try {
    const { action, name, email, password } = await req.json();

    if (action === "register") {
      return await registerUser(name, email, password);
    } else if (action === "login") {
      return await loginUser(email, password);
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
