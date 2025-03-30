import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 
export const sendWhatsAppMessage = async (phoneNumber, name, planDuration, expiryDate) => {
    try {
        const message = await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER, // Twilio Sandbox Number
            to: `whatsapp:${phoneNumber}`,
            body: `Hello ${name}, you have subscribed for ${planDuration}. Your membership expires on ${expiryDate}.`
        });
        console.log("WhatsApp message sent:", message.sid);
    } catch (error) {
        console.error("WhatsApp Error:", error);
    }
};
