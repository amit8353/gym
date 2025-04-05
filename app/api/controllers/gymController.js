import { NextResponse } from "next/server";
import { withCors } from "../../lib/cors";
import dbConnect from "../../lib/dbConnect";
import GymMember from "../../models/GymMember";
import { authMiddleware } from "../../lib/authMiddleware";
import { sendWhatsAppMessage } from "../../utils/sendWhatsApp";
import { sendEmail } from "../../utils/sendEmail";
import { calculateExpiryDate } from "../../utils/calculateExpiry";

// ✅ CREATE MEMBER
export async function createMember(req) {
  await dbConnect();

  const auth = authMiddleware(req);
  if (auth.status !== 200) return withCors(auth.response);

  try {
    const { name, age, address, planDuration, phoneNumber, email } = await req.json();

    if (!name || !age || !address || !planDuration || !phoneNumber || !email) {
      return withCors(
        NextResponse.json({ message: "All fields are required" }, { status: 400 })
      );
    }

    const existingMember = await GymMember.findOne({ email });
    console.log(existingMember, email)
    if (existingMember) {
      return withCors(
        NextResponse.json({ message: "Member with this email already exists" }, { status: 400 })
      );
    } 

    let durationInMonths;
    if (typeof planDuration === "string") {
      const matches = planDuration.match(/\d+/);
      durationInMonths = matches ? parseInt(matches[0]) : null;
    } else if (typeof planDuration === "number") {
      durationInMonths = planDuration;
    }

    if (!durationInMonths) {
      return withCors(
        NextResponse.json({ message: "Invalid plan duration format." }, { status: 400 })
      );
    }

    const expiryDate = calculateExpiryDate(durationInMonths);

    const gymMember = await GymMember.create({
      name,
      age,
      address,
      planDuration: durationInMonths,
      phoneNumber,
      email,
      expiryDate,
    });

    await sendWhatsAppMessage(phoneNumber, name, durationInMonths, expiryDate);

    return withCors(
      NextResponse.json({ message: "Gym Member Created & Notified", gymMember }, { status: 201 })
    );
  } catch (error) {
    console.error("❌ Error during member creation:", error);
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}

// ✅ GET MEMBERS
export async function getMembers(req) {
  await dbConnect();

  const auth = authMiddleware(req);
  if (auth.status !== 200) return withCors(auth.response);

  try {
    const gymMembers = await GymMember.find();
    return withCors(NextResponse.json(gymMembers, { status: 200 }));
  } catch (error) {
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}

// ✅ UPDATE MEMBER
export async function updateMember(req) {
  await dbConnect();

  const auth = authMiddleware(req);
  if (auth.status !== 200) return withCors(auth.response);

  try {
    const { id, name, age, address, planDuration, phoneNumber, email } = await req.json();

    if (!id || !name || !age || !address || !planDuration || !phoneNumber || !email) {
      return withCors(
        NextResponse.json({ message: "All fields are required" }, { status: 400 })
      );
    }

    const expiryDate = calculateExpiryDate(planDuration);

    const updatedMember = await GymMember.findByIdAndUpdate(
      id,
      { name, age, address, planDuration, phoneNumber, email, expiryDate },
      { new: true }
    );

    if (!updatedMember)
      return withCors(NextResponse.json({ message: "Gym Member not found" }, { status: 404 }));

    await sendWhatsAppMessage(phoneNumber, name, planDuration, expiryDate);
    await sendEmail(email, name, planDuration, expiryDate);

    return withCors(
      NextResponse.json({ message: "Gym Member Updated & Notified", updatedMember }, { status: 200 })
    );
  } catch (error) {
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}

// ✅ DELETE MEMBER
export async function deleteMember(req) {
  await dbConnect();

  const auth = authMiddleware(req);
  if (auth.status !== 200) return withCors(auth.response);

  try {
    const { id } = await req.json();

    if (!id)
      return withCors(NextResponse.json({ message: "ID is required" }, { status: 400 }));

    const deletedMember = await GymMember.findByIdAndDelete(id);

    if (!deletedMember)
      return withCors(NextResponse.json({ message: "Gym Member not found" }, { status: 404 }));

    return withCors(NextResponse.json({ message: "Gym Member Deleted" }, { status: 200 }));
  } catch (error) {
    return withCors(
      NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
    );
  }
}
