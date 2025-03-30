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
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw new Error('Database connection error');
  }
};

export default dbConnect;
