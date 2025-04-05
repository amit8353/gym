import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function authMiddleware(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      response: NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { status: 200, user: decoded };
  } catch (error) {
    return {
      status: 403,
      response: NextResponse.json({ message: "Forbidden - Invalid token" }, { status: 403 }),
    };
  }
}



// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export async function authMiddleware(req) {
//     try {
//         const authHeader = req.headers.get("Authorization");
//         if (!authHeader) {
//             return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//         }

//         const tokenParts = authHeader.split(" ");
//         if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
//             return NextResponse.json({ message: "Invalid token format" }, { status: 401 });
//         }

//         const token = tokenParts[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Attach user data to request
//         req.user = decoded;
//         return NextResponse.next(); // Allow the request to proceed
//     } catch (error) {
//         console.error("JWT Verification Error:", error.message);
//         return NextResponse.json({ message: "Invalid token" }, { status: 401 });
//     }
// }
