import mongoose from "mongoose";

export async function connectMongo() {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "blog-summarizer",
    });

    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}
