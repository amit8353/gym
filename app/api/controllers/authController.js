import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();

  try {
      const { name, email, password } = await req.json();
      console.log("Received data:", { name, email, password }); // Log input data

      if (!name || !email || !password) {
          return NextResponse.json({ message: "All fields are required" }, { status: 400 });
      }

      const userExists = await User.findOne({ email });
      if (userExists) return NextResponse.json({ message: "User already exists" }, { status: 400 });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });

      console.log(user); // log the created user for debugging

      return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
      console.error("Error during user registration:", error); // Log the full error
      return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}



// ✅ LOGIN USER
export async function login(req, res) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE PROFILE (Fix)
export async function updateProfile(req, res) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ message: "ID and Name are required" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.name = name;
    await user.save();

    return NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
