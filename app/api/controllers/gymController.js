import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import GymMember from "../../models/GymMember";
import { authMiddleware } from "../../lib/authMiddleware";
import { sendWhatsAppMessage } from "../../utils/sendWhatsApp";
import { sendEmail } from "../../utils/sendEmail";
import { calculateExpiryDate } from "../../utils/calculateExpiry";


export async function createMember(req) {
    await dbConnect();

    const authResponse = authMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    try {
        const { name, age, address, planDuration, phoneNumber, email } = await req.json();

        // Ensure all required fields are provided
        if (!name || !age || !address || !planDuration || !phoneNumber || !email) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Check if planDuration is a string like "5 months" or "6 weeks"
        let durationInMonths;

        if (typeof planDuration === 'string') {
            const matches = planDuration.match(/\d+/);
            if (matches) {
                durationInMonths = parseInt(matches[0]); // Get the numeric part
            } else {
                return NextResponse.json({ message: "Invalid plan duration format. Please provide a valid number." }, { status: 400 });
            }
        } else if (typeof planDuration === 'number') {
            // If planDuration is already a number
            durationInMonths = planDuration;
        } else {
            return NextResponse.json({ message: "Invalid plan duration format." }, { status: 400 });
        }

        // Calculate expiry date based on the duration
        const expiryDate = calculateExpiryDate(durationInMonths);

        // Create the gym member
        const gymMember = await GymMember.create({
            name,
            age,
            address,
            planDuration: durationInMonths, // Save as a number
            phoneNumber,
            email,
            expiryDate
        });

        console.log(gymMember); // Log the created gym member object

        // Send WhatsApp message and/or email (if necessary)
        await sendWhatsAppMessage(phoneNumber, name, durationInMonths, expiryDate);
        // await sendEmail(email, name, durationInMonths, expiryDate);

        return NextResponse.json({ message: "Gym Member Created & Notified", gymMember }, { status: 201 });
    } catch (error) {
        console.error("Error during member creation:", error); // Log full error for debugging
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}




// ✅ GET ALL MEMBERS
export async function getMembers(req) {
    await dbConnect();

    const authResponse = authMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    try {
        const gymMembers = await GymMember.find();
        return NextResponse.json(gymMembers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

// ✅ UPDATE MEMBER
export async function updateMember(req) {
    await dbConnect();

    const authResponse = authMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    try {
        const { id, name, age, address, planDuration, phoneNumber, email } = await req.json();
        if (!id || !name || !age || !address || !planDuration || !phoneNumber || !email) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const expiryDate = calculateExpiryDate(planDuration);
        const updatedMember = await GymMember.findByIdAndUpdate(id, { name, age, address, planDuration, phoneNumber, email, expiryDate }, { new: true });

        if (!updatedMember) return NextResponse.json({ message: "Gym Member not found" }, { status: 404 });

        await sendWhatsAppMessage(phoneNumber, name, planDuration, expiryDate);
        await sendEmail(email, name, planDuration, expiryDate);

        return NextResponse.json({ message: "Gym Member Updated & Notified", updatedMember }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

// ✅ DELETE MEMBER
export async function deleteMember(req) {
    await dbConnect();

    const authResponse = authMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

        const deletedMember = await GymMember.findByIdAndDelete(id);
        if (!deletedMember) return NextResponse.json({ message: "Gym Member not found" }, { status: 404 });

        return NextResponse.json({ message: "Gym Member Deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
