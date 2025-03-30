import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Ensure DB connection is stable
const ensureDbConnection = async () => {
  try {
    await dbConnect();
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    throw new Error("Database Connection Error");
  }
};

// Register User
const registerUser = async (name, email, password) => {
  try {
    console.log("📩 Registering user:", { name, email });

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password (Optimize: Lower salt rounds for faster execution)
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });
    console.log("✅ User created:", user);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

// Login User
const loginUser = async (email, password) => {
  try {
    console.log("🔑 Logging in user:", email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

// Set CORS Headers
const setCors = (res) => {
  res.headers.set("Access-Control-Allow-Origin", "*"); // Change '*' to your frontend domain for security
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
};

// Handle OPTIONS (Preflight CORS requests)
export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 204 }));
}

// Handle authentication requests
export async function POST(req) {
  try {
    await ensureDbConnection(); // Ensure DB is connected before processing

    const { action, name, email, password } = await req.json();
    console.log("📩 API Request:", { action, email });

    let response;
    if (action === "register") {
      response = await registerUser(name, email, password);
    } else if (action === "login") {
      response = await loginUser(email, password);
    } else {
      response = NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    return setCors(response);
  } catch (error) {
    console.error("❌ Error handling request:", error);
    return setCors(NextResponse.json({ message: "Server error", error: error.message }, { status: 500 }));
  }
}
