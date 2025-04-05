import { NextResponse } from "next/server";
import { createMember, getMembers, updateMember, deleteMember } from "../controllers/gymController";
import { withCors } from "../../lib/cors";

export async function POST(req) {
  return await createMember(req);
}

export async function GET(req) {
  return await getMembers(req);
}

export async function PUT(req) {
  return await updateMember(req);
}

export async function DELETE(req) {
  return await deleteMember(req);
}

// ✅ Handle CORS Preflight Request
export async function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}
