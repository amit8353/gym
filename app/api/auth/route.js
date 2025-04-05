import { withCors } from "../../lib/cors";
import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register User
const registerUser = async (name, email, password) => {
  await dbConnect();

  try {
    console.log("Received registration data:", { name, email, password });

    if (!name || !email || !password) {
      return withCors(NextResponse.json({ message: "All fields are required" }, { status: 400 }));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return withCors(NextResponse.json({ message: "User already exists" }, { status: 400 }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    console.log(user);
    return withCors(NextResponse.json({ message: "User registered successfully" }, { status: 201 }));
  } catch (error) {
    console.error("Error during user registration:", error);
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
};

// ✅ Login User
const loginUser = async (email, password) => {
  await dbConnect();

  try {
    if (!email || !password) {
      return withCors(NextResponse.json({ message: "Email and password are required" }, { status: 400 }));
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return withCors(NextResponse.json({ message: "Invalid credentials" }, { status: 401 }));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return withCors(
      NextResponse.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      })
    );
  } catch (error) {
    console.error("Error during user login:", error);
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
};

// ✅ Handle POST request (register or login)
export async function POST(req) {
  try {
    const { action, name, email, password } = await req.json();
    console.log("Action received:", action);

    if (action === "register") {
      return await registerUser(name, email, password);
    } else if (action === "login") {
      return await loginUser(email, password);
    } else {
      return withCors(NextResponse.json({ message: "Invalid action" }, { status: 400 }));
    }
  } catch (error) {
    console.error("Error handling POST request:", error);
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}

// ✅ Handle preflight CORS
export function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}
