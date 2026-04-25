// config/db.js

import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mental_health_ai");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
}