import { NextResponse } from "next/server";
import { withCors } from "../../lib/cors";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ REGISTER USER
export async function POST(req) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();
    console.log("Received data:", { name, email, password });

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
}

// ✅ LOGIN USER
export async function login(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return withCors(NextResponse.json({ message: "All fields are required" }, { status: 400 }));
    }

    const user = await User.findOne({ email });
    const isPasswordValid = user && (await bcrypt.compare(password, user.password));
    if (!isPasswordValid) {
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
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}

// ✅ UPDATE PROFILE
export async function updateProfile(req) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return withCors(NextResponse.json({ message: "ID and Name are required" }, { status: 400 }));
    }

    const user = await User.findById(id);
    if (!user) {
      return withCors(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }

    user.name = name;
    await user.save();

    return withCors(
      NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 })
    );
  } catch (error) {
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}