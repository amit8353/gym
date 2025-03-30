import mongoose from "mongoose";

const GymMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    planDuration: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    expiryDate: { type: Date, required: true }
});

// ✅ Fix: Prevent model overwriting in Next.js
const GymMember = mongoose.models.GymMember || mongoose.model("GymMember", GymMemberSchema);

export default GymMember;
