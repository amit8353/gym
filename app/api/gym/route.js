
import { NextResponse } from "next/server";
import { createMember, getMembers, updateMember, deleteMember } from "../controllers/gymController";

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

