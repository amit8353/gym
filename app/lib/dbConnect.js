// import mongoose from 'mongoose';

// const dbConnect = async () => {
//   if (mongoose.connection.readyState >= 1) return;
//   try {
//     const MONGO_URI = process.env.MONGO_URI;
//     if (!MONGO_URI) {
//       throw new Error("MongoDB URI is not defined");
//     }
//     await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log("MongoDB Connected");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// };

// export default dbConnect;


import mongoose from 'mongoose';

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) return;  // Return if already connected

  try {
    await mongoose.connect(process.env.MONGO_URI);  // Remove the deprecated options
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default dbConnect;

