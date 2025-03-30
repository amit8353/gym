import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function authMiddleware(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return NextResponse.json({ message: "Invalid token format" }, { status: 401 });
        }

        const token = tokenParts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded;
        return NextResponse.next(); // Allow the request to proceed
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}
