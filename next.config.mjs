/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      MONGO_URI: process.env.MONGO_URI,
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    },
  };
  
  export default nextConfig;
  