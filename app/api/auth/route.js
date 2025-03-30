import { NextResponse } from "next/server";
// import { registerUser, login, updateProfile } from "../controllers/authController"; 
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';


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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({ name, email, password: hashedPassword });

    console.log(user); // log the created user for debugging

    // Return success response
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

// Login an existing user
const loginUser = async (email, password) => {
  await dbConnect();

  try {
    // Validate input data
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return success response with the token and user data
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
};

// Function to set CORS headers
const setCors = (res) => {
  res.headers.set("Access-Control-Allow-Origin", "*"); // Change '*' to your frontend domain
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
};

// Handle preflight requests
export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 204 }));
}

// Handle authentication requests
export async function POST(req) {
  await dbConnect();

  try {
    const { action, name, email, password } = await req.json();
    console.log("📩 Request received:", { action, email });

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
    console.error("❌ Error handling POST request:", error);
    return setCors(NextResponse.json({ message: "Server error", error: error.message }, { status: 500 }));
  }
}


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
