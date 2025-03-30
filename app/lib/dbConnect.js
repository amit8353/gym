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
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // Deprecated, remove this line
    useUnifiedTopology: true, // You can keep this
  });
};
export default dbConnect