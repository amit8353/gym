import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.ADMIN_EMAIL, pass: process.env.EMAIL_PASSWORD }
});

export const sendEmail = async (email, name, planDuration, expiryDate) => {
    try {
        await transporter.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "Gym Membership Confirmation",
            text: `Hello ${name},\n\nYou subscribed for ${planDuration}. Membership expires on ${expiryDate}.`
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email Error:", error);
    }
};
